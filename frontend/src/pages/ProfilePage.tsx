import { useSearchParams } from 'react-router-dom';
import { MyPostsList } from '../components/profile/MyPostsList';
import { ProfileSettings } from '../components/profile/ProfileSettings';
import { Tabs } from '../components/Tabs';
import { useAuth } from '../hooks/useAuth';

const PROFILE_TABS = [
  { key: 'settings', label: '资料设置' },
  { key: 'posts', label: '我的帖子' },
] as const;

type ProfileTab = (typeof PROFILE_TABS)[number]['key'];

function parseTab(value: string | null): ProfileTab {
  return value === 'posts' ? 'posts' : 'settings';
}

export function ProfilePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));

  function handleTabChange(key: string) {
    const nextTab = parseTab(key);
    const nextParams = new URLSearchParams(searchParams);

    if (nextTab === 'settings') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', nextTab);
    }

    setSearchParams(nextParams, { replace: true });
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        加载中...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">个人中心</h1>
      <p className="mt-2 text-sm text-slate-600">管理资料与查看已发布的帖子</p>

      <div className="mt-6">
        <Tabs
          tabs={[...PROFILE_TABS]}
          activeKey={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {activeTab === 'settings' ? <ProfileSettings /> : <MyPostsList />}
    </div>
  );
}
