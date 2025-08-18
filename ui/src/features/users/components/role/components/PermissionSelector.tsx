import React from 'react';
import { Form, TreeSelect, Tag } from 'antd';
import { KeyOutlined, DatabaseOutlined } from '@ant-design/icons';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionSelectorProps {
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  allPermissions: string[];
}

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  onPermissionsChange,
  allPermissions,
}) => {
  const { data: permissions } = usePermissions();
  
  // Create styled tree data inline
  const permissionsTreeData = React.useMemo(() => {
    if (!permissions) return [];
    
    // Group permissions by group name (extract from permission name format: groupname.permissionname)
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const [group] = permission.name.split('.');
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return Object.entries(groupedPermissions).map(([group, perms]) => ({
      title: (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
            <DatabaseOutlined className="text-blue-600 text-xs" />
          </div>
          <span className="font-medium capitalize">{group} Permissions</span>
          <span className="text-xs text-gray-500">({perms.length})</span>
        </div>
      ),
      key: `group-${group}`,
      value: `group-${group}`,
               children: perms.map((permission, index) => {
           const [, action] = permission.name.split('.');
           
           // Show all permissions in the dropdown, but limit display in the tree view
           if (index < 2) {
             // First 2 permissions with full styling
             return {
               title: (
                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                     <KeyOutlined className="text-white text-xs" />
                   </div>
                   <span className="font-medium">{action || permission.name}</span>
                   {permission.description && (
                     <span className="text-xs text-gray-500 ml-2">- {permission.description}</span>
                   )}
                   {permission.action && (
                     <Tag color="green" className="ml-2 text-xs">{permission.action}</Tag>
                   )}
                 </div>
               ),
               key: permission.name,
               value: permission.name,
               isLeaf: true,
             };
           } else {
             // Additional permissions with simpler styling but still selectable
             return {
               title: (
                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-4 bg-gray-200 rounded-lg flex items-center justify-center">
                     <KeyOutlined className="text-gray-600 text-xs" />
                   </div>
                   <span className="font-medium text-gray-700">{action || permission.name}</span>
                   {permission.description && (
                     <span className="text-xs text-gray-500 ml-2">- {permission.description}</span>
                   )}
                 </div>
               ),
               key: permission.name,
               value: permission.name,
               isLeaf: true,
             };
           }
         }),
    }));
  }, [permissions]);

  return (
    <Form.Item
      name="permissions"
      label={<span className="text-gray-700 font-medium">Permissions</span>}
      rules={[{ required: true, message: 'At least one permission is required' }]}
    >
      <div className="space-y-4">
        {/* Selected Permissions Count */}
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <span className="font-medium">Selected:</span> {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''}
        </div>
        
        {/* Quick Selection */}
        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <KeyOutlined className="text-white text-xs" />
            </div>
            <div className="font-medium text-gray-900">Quick Selection</div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-blue-100 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                onChange={(e) => {
                  if (e.target.checked) {
                    onPermissionsChange(allPermissions);
                  } else {
                    onPermissionsChange([]);
                  }
                }}
                checked={selectedPermissions.length === allPermissions.length}
              />
              <span className="font-medium text-gray-900">Select All Permissions</span>
              <span className="text-sm text-gray-500">({allPermissions.length} total)</span>
            </label>
          </div>
        </div>

        {/* TreeSelect for Permissions */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <KeyOutlined className="text-white text-xs" />
            </div>
            <div className="font-medium text-gray-900">Permission Selection</div>
          </div>
          
          <TreeSelect
            treeData={permissionsTreeData}
            value={selectedPermissions}
            onChange={(value) => {
              // Handle both array and single value cases
              const selectedValues = Array.isArray(value) ? value : [value];
              
              // Filter out group keys and only keep actual permission names
              const permissionValues = selectedValues.filter(v => 
                v && !v.startsWith('group-') && !v.startsWith('more-')
              );
              
              onPermissionsChange(permissionValues);
            }}
            multiple
            treeCheckable
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            placeholder="Select permissions"
            style={{ width: '100%' }}
            className="rounded-lg"
            treeDefaultExpandAll
            allowClear
            showSearch
            maxTagCount={3}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
            filterTreeNode={(inputValue, treeNode) => {
              if (treeNode.title && typeof treeNode.title === 'string') {
                return treeNode.title.toLowerCase().includes(inputValue.toLowerCase());
              }
              return false;
            }}
          />
        </div>
      </div>
    </Form.Item>
  );
};
