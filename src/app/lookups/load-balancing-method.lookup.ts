import { LoadBalancerPoolLoadBalancingMethod } from 'api_client';

export const methodsLookup: Record<LoadBalancerPoolLoadBalancingMethod, string> = {
  [LoadBalancerPoolLoadBalancingMethod.DynamicRatioMember]: 'Dynamic Ratio Member',
  [LoadBalancerPoolLoadBalancingMethod.DynamicRatioNode]: 'Dynamic Ratio Node',
  [LoadBalancerPoolLoadBalancingMethod.FastestAppResponse]: 'Fastest App Response',
  [LoadBalancerPoolLoadBalancingMethod.FastestNode]: 'Fastest Node',
  [LoadBalancerPoolLoadBalancingMethod.LeastConnectionsNode]: 'Least Connections Node',
  [LoadBalancerPoolLoadBalancingMethod.LeastSessions]: 'Least Sessions',
  [LoadBalancerPoolLoadBalancingMethod.ObservedMember]: 'Observed Member',
  [LoadBalancerPoolLoadBalancingMethod.ObservedNode]: 'Observed Node',
  [LoadBalancerPoolLoadBalancingMethod.PredictiveMember]: 'Predictive Member',
  [LoadBalancerPoolLoadBalancingMethod.PredictiveNode]: 'Predictive Node',
  [LoadBalancerPoolLoadBalancingMethod.RatioLeastConnectionsMember]: 'Ratio Least Connections Member',
  [LoadBalancerPoolLoadBalancingMethod.RatioLeastConnectionsNode]: 'Ratio Least Connections Node',
  [LoadBalancerPoolLoadBalancingMethod.RatioMember]: 'Ratio Member',
  [LoadBalancerPoolLoadBalancingMethod.RatioNode]: 'Ratio Node',
  [LoadBalancerPoolLoadBalancingMethod.RatioSession]: 'Ratio Session',
  [LoadBalancerPoolLoadBalancingMethod.RoundRobin]: 'Round Robin',
};
