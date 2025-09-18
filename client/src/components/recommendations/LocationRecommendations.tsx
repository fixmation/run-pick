import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  Star, 
  Car, 
  UtensilsCrossed, 
  Package, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  Info
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from '@/contexts/LocationContext';

interface RecommendationData {
  id: number;
  name: string;
  type: string;
  distance: number;
  rating?: number;
  estimatedTime?: number;
  metadata: any;
}

interface LocationRecommendationResult {
  serviceType: 'taxi' | 'food' | 'parcel';
  recommendations: RecommendationData[];
  confidence: number;
  distance: number;
  zoneInfo?: any;
}

interface LocationRecommendationsProps {
  userLocation?: { lat: number; lng: number };
  userId?: number;
  autoRefresh?: boolean;
  maxRecommendations?: number;
  onRecommendationClick?: (recommendation: RecommendationData, serviceType: string) => void;
}

const LocationRecommendations = ({ 
  userLocation,
  userId,
  autoRefresh = true,
  maxRecommendations = 3,
  onRecommendationClick
}: LocationRecommendationsProps) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'taxi' | 'food' | 'parcel'>('all');
  const { currentLocation } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Default to Colombo coordinates if no user location provided
  const defaultLocation = { lat: 6.9271, lng: 79.8612 };
  const effectiveLocation = userLocation || defaultLocation;

  // Fetch recommendations
  const { 
    data: recommendationsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/recommendations/location', effectiveLocation.lat, effectiveLocation.lng, userId],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: effectiveLocation.lat.toString(),
        longitude: effectiveLocation.lng.toString(),
      });
      if (userId) params.append('userId', userId.toString());

      const response = await fetch(`/api/recommendations/location?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
    refetchInterval: autoRefresh ? 300000 : false, // Refresh every 5 minutes if enabled
    staleTime: 120000, // Consider data stale after 2 minutes
  });

  // Mark recommendations as viewed
  const markViewedMutation = useMutation({
    mutationFn: async (recommendationIds: number[]) => {
      const response = await fetch('/api/recommendations/mark-viewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationIds })
      });
      if (!response.ok) {
        throw new Error('Failed to mark recommendations as viewed');
      }
      return response.json();
    },
    onError: (error) => {
      console.error('Failed to mark recommendations as viewed:', error);
    }
  });

  const recommendations: LocationRecommendationResult[] = recommendationsData?.recommendations || [];

  // Mark recommendations as viewed when component mounts or data changes
  useEffect(() => {
    if (recommendations.length > 0 && userId) {
      const allIds = recommendations.flatMap(r => r.recommendations.map(rec => rec.id));
      if (allIds.length > 0) {
        markViewedMutation.mutate(allIds);
      }
    }
  }, [recommendations, userId]);

  // Filter recommendations based on selected tab
  const filteredRecommendations = selectedTab === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.serviceType === selectedTab);

  const handleRecommendationClick = (recommendation: RecommendationData, serviceType: string) => {
    if (onRecommendationClick) {
      onRecommendationClick(recommendation, serviceType);
    } else {
      // Default behavior - show info toast
      toast({
        title: recommendation.name,
        description: `${recommendation.distance.toFixed(1)}km away • ${recommendation.estimatedTime || 'N/A'} min`,
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing recommendations",
      description: "Getting latest nearby services...",
    });
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'taxi': return <Car className="w-4 h-4" />;
      case 'food': return <UtensilsCrossed className="w-4 h-4" />;
      case 'parcel': return <Package className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getServiceTitle = (serviceType: string) => {
    switch (serviceType) {
      case 'taxi': return 'Nearby Drivers';
      case 'food': return 'Restaurants Nearby';
      case 'parcel': return 'Delivery Options';
      default: return 'Services';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Finding nearby services...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Info className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-gray-600">Unable to load recommendations</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-gray-600">No nearby services found</p>
            <p className="text-sm text-gray-500">Try refreshing or check back later</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recommended for You
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Service tabs */}
        <div className="flex space-x-1 mt-3">
          {['all', 'taxi', 'food', 'parcel'].map(tab => (
            <Button
              key={tab}
              variant={selectedTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab(tab as any)}
              className="text-xs"
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredRecommendations.map((serviceGroup) => (
          <div key={serviceGroup.serviceType} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                {getServiceIcon(serviceGroup.serviceType)}
                {getServiceTitle(serviceGroup.serviceType)}
              </h3>
              <Badge 
                variant="secondary" 
                className={getConfidenceColor(serviceGroup.confidence)}
              >
                {Math.round(serviceGroup.confidence * 100)}% match
              </Badge>
            </div>

            <div className="grid gap-2">
              {serviceGroup.recommendations
                .slice(0, maxRecommendations)
                .map((recommendation) => (
                <div
                  key={`${serviceGroup.serviceType}-${recommendation.id}`}
                  className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRecommendationClick(recommendation, serviceGroup.serviceType)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{recommendation.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {recommendation.distance.toFixed(1)}km
                        </span>
                        {recommendation.estimatedTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recommendation.estimatedTime}min
                          </span>
                        )}
                        {recommendation.rating && recommendation.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {recommendation.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {serviceGroup.serviceType === 'food' && recommendation.metadata?.cuisine && (
                      <Badge variant="outline" className="text-xs">
                        {recommendation.metadata.cuisine}
                      </Badge>
                    )}
                    {serviceGroup.serviceType === 'parcel' && recommendation.metadata?.capacity && (
                      <Badge variant="outline" className="text-xs">
                        {recommendation.metadata.capacity}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {serviceGroup.recommendations.length > maxRecommendations && (
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View {serviceGroup.recommendations.length - maxRecommendations} more
              </Button>
            )}
          </div>
        ))}

        {recommendationsData?.cached && (
          <div className="text-xs text-gray-500 text-center">
            Showing cached results • Last updated: {new Date(recommendationsData.generatedAt || Date.now()).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationRecommendations;