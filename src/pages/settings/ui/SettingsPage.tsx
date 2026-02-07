import { useCurrentUser } from '@entities/session';
import { ChangePasswordForm } from '@features/auth';
import { Card, Spinner } from '@shared/ui';

export function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {user && (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Profile</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm max-w-sm">
            <dt className="text-gray-500">Username</dt>
            <dd>{user.username}</dd>
            <dt className="text-gray-500">Email</dt>
            <dd>{user.email}</dd>
            <dt className="text-gray-500">Role</dt>
            <dd className="capitalize">{user.role}</dd>
          </dl>
        </Card>
      )}

      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Change Password</h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
