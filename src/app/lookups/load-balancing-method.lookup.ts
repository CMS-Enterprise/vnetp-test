import { LoadBalancerPoolLoadBalancingMethodEnum } from 'client';

export const methodsLookup: Record<LoadBalancerPoolLoadBalancingMethodEnum, string> = {
  [LoadBalancerPoolLoadBalancingMethodEnum.DynamicRatioMember]: 'Dynamic Ratio Member',
  [LoadBalancerPoolLoadBalancingMethodEnum.DynamicRatioNode]: 'Dynamic Ratio Node',
  [LoadBalancerPoolLoadBalancingMethodEnum.FastestAppResponse]: 'Fastest App Response',
  [LoadBalancerPoolLoadBalancingMethodEnum.FastestNode]: 'Fastest Node',
  [LoadBalancerPoolLoadBalancingMethodEnum.LeastConnectionsNode]: 'Least Connections Node',
  [LoadBalancerPoolLoadBalancingMethodEnum.LeastSessions]: 'Least Sessions',
  [LoadBalancerPoolLoadBalancingMethodEnum.ObservedMember]: 'Observed Member',
  [LoadBalancerPoolLoadBalancingMethodEnum.ObservedNode]: 'Observed Node',
  [LoadBalancerPoolLoadBalancingMethodEnum.PredictiveMember]: 'Predictive Member',
  [LoadBalancerPoolLoadBalancingMethodEnum.PredictiveNode]: 'Predictive Node',
  [LoadBalancerPoolLoadBalancingMethodEnum.RatioLeastConnectionsMember]: 'Ratio Least Connections Member',
  [LoadBalancerPoolLoadBalancingMethodEnum.RatioLeastConnectionsNode]: 'Ratio Least Connections Node',
  [LoadBalancerPoolLoadBalancingMethodEnum.RatioMember]: 'Ratio Member',
  [LoadBalancerPoolLoadBalancingMethodEnum.RatioNode]: 'Ratio Node',
  [LoadBalancerPoolLoadBalancingMethodEnum.RatioSession]: 'Ratio Session',
  [LoadBalancerPoolLoadBalancingMethodEnum.RoundRobin]: 'Round Robin',
};
