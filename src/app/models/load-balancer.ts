
import { Rule } from './rule';
import { Backend } from './backend';
import { Frontend } from './frontend';

export class LoadBalancer {

    Id: number;
    Name: string;

    Frontends: Array<Frontend>;
    Backends: Array<Backend>;
    Rules: Array<Rule>;
}
