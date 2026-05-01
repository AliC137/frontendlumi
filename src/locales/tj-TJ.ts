import component from './tj-TJ/component';
import globalHeader from './tj-TJ/globalHeader';
import menu from './tj-TJ/menu';
import pages from './tj-TJ/pages';
import pwa from './tj-TJ/pwa';
import settingDrawer from './tj-TJ/settingDrawer';
import settings from './tj-TJ/settings';

export default {
  'navBar.lang': '🇹🇯 Тоҷикӣ',
  'layout.user.link.help': 'Ёрӣ',
  'layout.user.link.privacy': 'Махфият',
  'layout.user.link.terms': 'Шартҳо',
  'app.preview.down.block': 'Ин саҳифаро ба лоиҳаи маҳаллӣ боргирӣ кунед',
  'app.welcome.link.fetch-blocks': 'Ҳама блокҳоро гиред',
  'app.welcome.link.block-list': 'Сохтани зуд бо асоси `block`',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
};
