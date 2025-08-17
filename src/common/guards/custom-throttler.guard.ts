import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string> {
        const userId = req.user?.userId;
        return Promise.resolve(`${userId || req.ip}`);
    }

    protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
        const req = requestProps.context.switchToHttp().getRequest();
        const isAdmin = req.user?.roles?.includes('admin');

        if (isAdmin) {
            return true;
        }

        return super.handleRequest(requestProps);
    }
}