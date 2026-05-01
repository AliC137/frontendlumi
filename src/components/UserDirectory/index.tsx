import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Drawer,
  Checkbox,
  Dropdown,
  Menu,
  Tag,
  Typography,
  Tooltip,
  Row,
  Col,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { request } from '@umijs/max';
import {
  getAuthHeaders,
  getAllUsers,
  GetAllUsersParams,
  createAdminUser,
  updateAdminUser,
} from '@/services/ant-design-pro/api';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// User type definition
export interface User {
  id: number;
  login: string; // email
  name: string;
  role: string;
  created_dt?: string;
  updated_dt?: string;
  deleted_dt?: string | null;
}

// Directory configuration props
export interface UserDirectoryConfig {
  entityName?: string;
  entityAttributes?: string[];
  apiEndpoint?: string;
  columns?: ColumnsType<User>;
  onUserSelect?: (selectedUsers: User[]) => void;
  embedded?: boolean;
  embeddedField?: string;
}

interface UserDirectoryProps {
  config?: UserDirectoryConfig;
}

const UserDirectory: React.FC<UserDirectoryProps> = ({ config }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<any>({});
  const [filterForm] = Form.useForm();

  // Default columns configuration
  const defaultColumns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: true,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'login',
      key: 'login',
      width: 250,
      sorter: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_dt',
      key: 'created_dt',
      width: 180,
      sorter: true,
      render: (date: string) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_dt',
      key: 'updated_dt',
      width: 180,
      sorter: true,
      render: (date: string) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.deleted_dt ? 'default' : 'success'}>
          {record.deleted_dt ? 'Deleted' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="export">
                  <ExportOutlined /> Export Data
                </Menu.Item>
                <Menu.Item key="related">Related Entities</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="advanced">Advanced Options</Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button type="link" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Use config columns or default
  const columns = config?.columns || defaultColumns;

  // Fetch users from API
  const fetchUsers = async (params: any = {}) => {
    setLoading(true);
    try {
      // Merge active filters with params
      const mergedParams = {
        ...activeFilter,
        ...params,
      };

      const fetchParams: GetAllUsersParams = {
        page: mergedParams.current || currentPage || 1,
        limit: mergedParams.pageSize || pageSize || 10,
        ...(mergedParams.role && { role: mergedParams.role }),
        ...(mergedParams.search && { search: mergedParams.search }),
        ...(mergedParams.include_deleted !== undefined && {
          include_deleted: mergedParams.include_deleted,
        }),
        ...(mergedParams.sort_by && { sort_by: mergedParams.sort_by }),
        ...(mergedParams.sort_order && { sort_order: mergedParams.sort_order }),
      };

      const response = await getAllUsers(fetchParams);

      // Map the response items to User format
      const mappedUsers: User[] = response.items.map((item) => ({
        id: item.id,
        login: item.login,
        name: item.name,
        role: item.role,
        created_dt: item.created_dt,
        updated_dt: item.updated_dt,
        deleted_dt: null, // The API doesn't return deleted_dt in the items, but we can check if needed
      }));

      setUsers(mappedUsers);
      setTotal(response.total);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
      // Clear data on error
      setUsers([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle table changes (pagination, sorting, filtering)
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const sortParams: any = {};

    if (sorter && sorter.field) {
      // Map column keys to API sort_by values
      const sortFieldMap: { [key: string]: string } = {
        id: 'id',
        name: 'name',
        login: 'login',
        created_dt: 'created_dt',
        updated_dt: 'updated_dt',
      };

      sortParams.sort_by = sortFieldMap[sorter.field] || sorter.field;
      sortParams.sort_order = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    // Handle role filter from table filters (if not using filter drawer)
    const roleFilter = filters?.role?.[0];
    if (roleFilter && !activeFilter.role) {
      setActiveFilter((prev: any) => ({ ...prev, role: roleFilter }));
    }

    // Update page size if changed
    if (pagination.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }

    fetchUsers({
      current: pagination.current || 1,
      pageSize: pagination.pageSize || pageSize,
      role: roleFilter || activeFilter.role,
      search: activeFilter.search,
      include_deleted: activeFilter.include_deleted,
      ...sortParams,
    });
  };

  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user' });
    setIsModalVisible(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    try {
      const authHeaders = getAuthHeaders();
      await request(`/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      message.success('User deleted successfully');
      // Refresh with current filters and pagination
      fetchUsers({
        current: currentPage,
        pageSize: pageSize,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  // Handle view user details
  const handleViewUser = (user: User) => {
    Modal.info({
      title: 'User Details',
      width: 600,
      content: (
        <div style={{ padding: '20px 0' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>ID:</Text> {user.id}
            </Col>
            <Col span={12}>
              <Text strong>Name:</Text> {user.name}
            </Col>
            <Col span={12}>
              <Text strong>Email:</Text> {user.login}
            </Col>
            <Col span={12}>
              <Text strong>Role:</Text>{' '}
              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>{user.role}</Tag>
            </Col>
            <Col span={12}>
              <Text strong>Created:</Text>{' '}
              {user.created_dt ? new Date(user.created_dt).toLocaleString() : '-'}
            </Col>
            <Col span={12}>
              <Text strong>Updated:</Text>{' '}
              {user.updated_dt ? new Date(user.updated_dt).toLocaleString() : '-'}
            </Col>
          </Row>
        </div>
      ),
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { name, login, role, password } = values;

      if (editingUser) {
        // Update existing user using admin API
        await updateAdminUser(editingUser.id, {
          name,
          login,
          role,
          ...(password ? { password } : {}),
        });
        message.success('User updated successfully');
      } else {
        // Create new user
        if (!password) {
          throw new Error('Password is required for new users');
        }
        await createAdminUser(
          {
            name,
            login,
            password,
          },
          role || 'user',
        );
        message.success('User created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      // Refresh with current filters and pagination
      fetchUsers({
        current: currentPage,
        pageSize: pageSize,
      });
    } catch (error: any) {
      console.error('Error saving user:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields correctly');
      } else {
        message.error('Failed to save user');
      }
    }
  };

  // Handle row selection
  const handleRowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], selectedRows: User[]) => {
      setSelectedRowKeys(keys);
      setSelectedUsers(selectedRows);
      if (config?.onUserSelect) {
        config.onUserSelect(selectedRows);
      }
    },
    getCheckboxProps: (record: User) => ({
      disabled: false,
      name: record.name,
    }),
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const authHeaders = getAuthHeaders();
      await Promise.all(
        selectedRowKeys.map((key) =>
          request(`/api/v1/users/${key}`, {
            method: 'DELETE',
            headers: authHeaders,
          }),
        ),
      );
      message.success(`Deleted ${selectedRowKeys.length} users successfully`);
      setSelectedRowKeys([]);
      setSelectedUsers([]);
      // Refresh with current filters and pagination
      fetchUsers({
        current: currentPage,
        pageSize: pageSize,
      });
    } catch (error) {
      console.error('Error deleting users:', error);
      message.error('Failed to delete users');
    }
  };

  // Column settings
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey],
    );
  };

  const visibleColumnsData =
    visibleColumns.length > 0
      ? columns.filter((col) => visibleColumns.includes(col.key as string))
      : columns;

  // Handle apply filters from filter drawer
  const handleApplyFilters = () => {
    const filterValues = filterForm.getFieldsValue();
    const newFilters: any = {};

    // Combine name and email into search parameter (API supports search by name or login)
    // Priority: use name if provided, otherwise use email
    if (filterValues.name) {
      newFilters.search = filterValues.name;
    } else if (filterValues.email) {
      newFilters.search = filterValues.email;
    }

    if (filterValues.role) {
      newFilters.role = filterValues.role;
    }

    // Handle status filter (active = include_deleted: false, deleted = include_deleted: true)
    if (filterValues.status === 'active') {
      newFilters.include_deleted = false;
    } else if (filterValues.status === 'deleted') {
      newFilters.include_deleted = true;
    }

    // Reset to page 1 when applying filters
    setActiveFilter(newFilters);
    setCurrentPage(1);
    fetchUsers({
      current: 1,
      pageSize: pageSize,
      ...newFilters,
    });
    setFilterDrawerVisible(false);
    message.success('Filters applied successfully');
  };

  // Handle clear filters
  const handleClearFilters = () => {
    filterForm.resetFields();
    setActiveFilter({});
    setCurrentPage(1);
    fetchUsers({
      current: 1,
      pageSize: pageSize,
    });
    setFilterDrawerVisible(false);
    message.success('Filters cleared');
  };

  // Handle refresh - reset filters and fetch fresh data
  const handleRefresh = () => {
    filterForm.resetFields();
    setActiveFilter({});
    setCurrentPage(1);
    setPageSize(10);
    fetchUsers({
      current: 1,
      pageSize: 10,
    });
  };

  return (
    <Card
      title={config?.entityName || 'User Directory'}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button icon={<FilterOutlined />} onClick={() => setFilterDrawerVisible(true)}>
            Filters
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => setColumnSettingsVisible(true)}>
            Columns
          </Button>
          <Popconfirm
            title="Are you sure you want to delete selected users?"
            onConfirm={handleBulkDelete}
            disabled={selectedRowKeys.length === 0}
          >
            <Button danger disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />}>
              Delete Selected
            </Button>
          </Popconfirm>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            Add User
          </Button>
        </Space>
      }
    >
      <Table
        columns={visibleColumnsData}
        dataSource={users}
        rowKey="id"
        loading={loading}
        rowSelection={handleRowSelection}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} users`,
          pageSizeOptions: ['10', '20', '50', '100'],
          // Smart pagination: if total < pageSize, show all on one page
          // The backend will handle this, but we ensure UI reflects it correctly
          hideOnSinglePage: false, // Always show pagination controls
        }}
        scroll={{ x: 1200 }}
        onChange={handleTableChange}
      />

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="login"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: !editingUser,
                message: 'Please enter password',
              },
            ]}
          >
            <Input.Password
              placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Filter Drawer */}
      <Drawer
        title="Filters"
        placement="right"
        width={400}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        extra={
          <Space>
            <Button onClick={handleClearFilters}>Clear</Button>
            <Button type="primary" onClick={handleApplyFilters}>
              Apply
            </Button>
          </Space>
        }
        afterOpenChange={(open) => {
          if (open) {
            // Sync form with active filters when drawer opens
            const formValues: any = {};
            // Don't auto-populate name/email from search since we can't determine which was used
            // User can re-enter their search term if needed
            if (activeFilter.role) {
              formValues.role = activeFilter.role;
            }
            if (activeFilter.include_deleted !== undefined) {
              formValues.status = activeFilter.include_deleted ? 'deleted' : 'active';
            }
            filterForm.setFieldsValue(formValues);
          } else {
            // Clear form when drawer closes to prevent stale values
            filterForm.resetFields();
          }
        }}
      >
        <Form form={filterForm} layout="vertical">
          <Form.Item name="name" label="Search by Name">
            <Input placeholder="Enter name" allowClear />
          </Form.Item>
          <Form.Item name="email" label="Search by Email">
            <Input placeholder="Enter email" allowClear />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select placeholder="Select role" allowClear>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select placeholder="Select status" allowClear>
              <Option value="active">Active</Option>
              <Option value="deleted">Deleted</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Column Settings Drawer */}
      <Drawer
        title="Column Settings"
        placement="right"
        width={300}
        onClose={() => setColumnSettingsVisible(false)}
        open={columnSettingsVisible}
      >
        <Form layout="vertical">
          {columns.map((column) => (
            <Form.Item key={column.key as string}>
              <Checkbox
                checked={
                  visibleColumns.length === 0 || visibleColumns.includes(column.key as string)
                }
                onChange={() => toggleColumnVisibility(column.key as string)}
              >
                {column.title as string}
              </Checkbox>
            </Form.Item>
          ))}
        </Form>
      </Drawer>
    </Card>
  );
};

export default UserDirectory;
