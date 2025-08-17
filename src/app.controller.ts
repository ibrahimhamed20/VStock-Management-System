import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): { status: string; message: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('health')
  getHealthCheck(): { status: string; message: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('info')
  getSystemInfo() {
    return this.appService.getSystemInfo();
  }

  @Get('api')
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }

  @Get('docs')
  getDocumentation() {
    return {
      message: 'API Documentation',
      swagger: '/api/docs',
      description: 'Interactive API documentation with Swagger UI',
      endpoints: [
        'GET / - Health check',
        'GET /health - Health check (alternative)',
        'GET /info - System information',
        'GET /api - API endpoints and features',
        'GET /status - System status and metrics',
        'GET /docs - This documentation info',
        'GET /api/docs - Swagger UI documentation',
      ],
    };
  }
}
