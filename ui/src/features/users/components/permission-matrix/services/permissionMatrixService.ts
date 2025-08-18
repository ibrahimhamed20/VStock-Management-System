import { AuthService } from '@auth/services';
import type { PermissionMatrixData } from '@auth/types';

export class PermissionMatrixService {
    static async getPermissionMatrix(): Promise<PermissionMatrixData> {
        try {
            const permissionMatrix = await AuthService.getPermissionMatrix();
            return permissionMatrix;
        } catch (error) {
            console.error('Error fetching permission matrix:', error);
            throw new Error('Failed to fetch permission matrix');
        }
    }
}
