import { AvatarDropdown, AvatarName, Question, SelectLang } from '@/components';
import { getCurrentUserInfo } from '@/services/ant-design-pro/api';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const SKIP_LOGIN = true;

const demoUser: API.CurrentUser = {
  name: 'Presentation User',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
  userid: 'demo-user',
  email: 'demo@local',
  signature: 'Login bypass for presentation',
  title: 'Demo',
  group: 'Presentation Mode',
  tags: [{ key: '0', label: 'demo' }],
  notifyCount: 0,
  unreadCount: 0,
  country: 'N/A',
  access: 'admin',
  geographic: {
    province: { label: 'N/A', key: '000000' },
    city: { label: 'N/A', key: '000000' },
  },
  address: 'N/A',
  phone: 'N/A',
};

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    if (SKIP_LOGIN) {
      return demoUser;
    }
    try {
      const userInfo = await getCurrentUserInfo({
        skipErrorHandler: true,
      });
      return userInfo;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // If it's not the login page, execute
  const { location } = history;
  if (SKIP_LOGIN) {
    return {
      fetchUserInfo,
      currentUser: demoUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout supported APIs https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<Question key="doc" />, <SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    onPageChange: () => {
      const { location } = history;
      // If not logged in, redirect to login
      if (!SKIP_LOGIN && !initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI Documentation</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // Custom 403 page
    // unAccessible: <div>unAccessible</div>,
    // Add a loading state
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request configuration, can configure error handling
 * It provides a unified network request and error handling solution based on axios and ahooks useRequest.
 * @doc https://umijs.org/docs/max/request#configuration
 */
export const request = {
  ...errorConfig,
};
