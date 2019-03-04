import { Frontend } from './frontend';
import { Backend } from './backend';
import { HealthCheck } from './health-check';

export class Rule {
    Id: number;
    Name: string;
    ProtocolTypeString: string;
    Protocol: number;
    Port: number;

    Frontend: Frontend;
    FrontendId: number;
    Backend: Backend;
    BackendId: number;
    HealthCheck: HealthCheck;
}
