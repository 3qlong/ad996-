
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const LoginDialog = () => {
  const { isLoginDialogOpen, closeLoginDialog, login } = useAuth();

  React.useEffect(() => {
    if (isLoginDialogOpen) {
      // Simulate checking for subscription and auto-login after 3 seconds
      const timerId = setTimeout(login, 3000);
      return () => clearTimeout(timerId);
    }
  }, [isLoginDialogOpen, login]);

  return (
    <Dialog open={isLoginDialogOpen} onOpenChange={closeLoginDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-6">
          <img
            src="/lovable-uploads/3e5186a1-721e-4da3-b422-1bc22a50f4ff.png"
            alt="微信服务号二维码"
            className="w-40 h-40 md:w-48 md:h-48 rounded-lg"
          />
          <div className="text-center space-y-1">
            <p className="text-lg text-gray-900 font-normal">扫码关注服务号完成登录</p>
            <p className="text-xs text-gray-500">
              登录即视为同意
              <a href="/user-agreement" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">《用户协议》</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
