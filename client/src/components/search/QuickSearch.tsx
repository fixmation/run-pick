import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Car, 
  UtensilsCrossed, 
  Package, 
  Loader2, 
  X,
  TrendingUp,
  History,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@/contexts/LocationContext';

interface SearchResult {
  id: string;
  type: 'taxi' | 'restaurant' | 'driver' | 'service';
  title: string;
  subtitle: string;
  description?: string;
  distance?: number;
  rating?: number;
  estimatedTime?: number;
  price?: string;
  imageUrl?: string;
  tags?: string[];
  metadata?: any;
}

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  searchTypes?: ('taxi' | 'food' | 'parcel')[];
}

const QuickSearch = ({ 
  isOpen, 
  onClose, 
  onResultSelect,
  placeholder = "Search for taxis, restaurants, services...",
  searchTypes = ['taxi', 'food', 'parcel']
}: QuickSearchProps) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'taxi' | 'food' | 'parcel'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentLocation } = useLocation();
  const { toast } = useToast();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('runpick-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search API call
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query, activeFilter, currentLocation],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      const params = new URLSearchParams({
        q: query,
        location: currentLocation,
        filter: activeFilter === 'all' ? '' : activeFilter
      });

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  // Mock search results for demo
  const getMockResults = (searchQuery: string): SearchResult[] => {
    if (searchQuery.length < 2) return [];

    const mockResults: SearchResult[] = [
      {
        id: 'taxi-1',
        type: 'taxi',
        title: 'Nearby Taxi',
        subtitle: '3 min away',
        description: 'Blue Toyota Prius - Kasun',
        distance: 0.8,
        rating: 4.8,
        estimatedTime: 3,
        price: 'LKR 120/km',
        tags: ['Available Now', 'AC'],
        metadata: { vehicleType: 'car', driverId: 1 }
      },
      {
        id: 'restaurant-1',
        type: 'restaurant',
        title: 'Spice Island Restaurant',
        subtitle: 'Sri Lankan Cuisine',
        description: 'Authentic curries and rice dishes',
        distance: 2.1,
        rating: 4.5,
        estimatedTime: 25,
        price: 'LKR 800-1500',
        tags: ['Popular', 'Spicy'],
        metadata: { cuisine: 'Sri Lankan', restaurantId: 1 }
      },
      {
        id: 'parcel-1',
        type: 'driver',
        title: 'Parcel Delivery',
        subtitle: 'Available for pickup',
        description: 'Van available for large packages',
        distance: 1.5,
        rating: 4.6,
        estimatedTime: 5,
        price: 'From LKR 200',
        tags: ['Large Capacity'],
        metadata: { vehicleType: 'van', service: 'parcel' }
      }
    ];

    return mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const results = searchResults || getMockResults(query);

  // Filter results based on active filter
  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter((result: SearchResult) => {
        if (activeFilter === 'taxi') return result.type === 'taxi' || (result.type === 'driver' && result.metadata?.service !== 'parcel');
        if (activeFilter === 'food') return result.type === 'restaurant';
        if (activeFilter === 'parcel') return result.type === 'driver' && result.metadata?.service === 'parcel';
        return true;
      });

  const saveRecentSearch = (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('runpick-recent-searches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    onResultSelect?.(result);
    onClose();
    
    toast({
      title: result.title,
      description: `${result.subtitle} • ${result.distance?.toFixed(1)}km away`,
    });
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('runpick-recent-searches');
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'taxi': 
      case 'driver':
        return <Car className="w-4 h-4" />;
      case 'restaurant':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'service':
        return <Package className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'taxi':
      case 'driver':
        return 'text-blue-600 bg-blue-100';
      case 'restaurant':
        return 'text-green-600 bg-green-100';
      case 'service':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-4 h-12 text-lg border-0 focus:ring-0 focus:outline-none"
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery('')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mt-3">
                {['all', ...searchTypes].map(filter => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFilter(filter as any)}
                    className="text-xs"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading && (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Searching...</p>
                </div>
              )}

              {!isLoading && query.length >= 2 && (
                <AnimatePresence>
                  {filteredResults.length > 0 ? (
                    <div className="p-2">
                      {filteredResults.map((result: SearchResult, index: number) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultClick(result)}
                          className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getServiceColor(result.type)}`}>
                              {getServiceIcon(result.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm truncate">{result.title}</h3>
                                {result.tags && result.tags.slice(0, 2).map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <p className="text-xs text-gray-600 mb-1">{result.subtitle}</p>
                              
                              {result.description && (
                                <p className="text-xs text-gray-500 truncate">{result.description}</p>
                              )}
                              
                              <div className="flex items-center gap-3 mt-2">
                                {result.distance && (
                                  <span className="flex items-center gap-1 text-xs text-gray-600">
                                    <MapPin className="w-3 h-3" />
                                    {result.distance.toFixed(1)}km
                                  </span>
                                )}
                                {result.estimatedTime && (
                                  <span className="flex items-center gap-1 text-xs text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    {result.estimatedTime}min
                                  </span>
                                )}
                                {result.rating && (
                                  <span className="flex items-center gap-1 text-xs text-gray-600">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {result.rating.toFixed(1)}
                                  </span>
                                )}
                                {result.price && (
                                  <span className="text-xs font-medium text-gray-800">
                                    {result.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No results found for "{query}"</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </AnimatePresence>
              )}

              {/* Recent Searches & Trending */}
              {query.length < 2 && (
                <div className="p-4 space-y-4">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Recent Searches
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(search)}
                            className="block w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-600"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Trending Searches
                    </h3>
                    <div className="space-y-1">
                      {['Taxi to airport', 'Pizza delivery', 'Parcel to Kandy', 'Kottu near me'].map((trending, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(trending)}
                          className="block w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-600"
                        >
                          {trending}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuickSearch;