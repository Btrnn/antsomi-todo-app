// Libraries
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useDispatch } from 'react-redux';

// Components
import { Button, Input, Checkbox, Form, type FormProps, Col, Row, message } from 'components/ui';

// Images
import image from 'assets/images/background.jpg';

// Services
import { checkAuthentication } from 'services/authentication';
import { getUserInfo } from 'services/user';

// Cookies
import { useAuth } from 'hooks';

// Stores
import { AppDispatch, setUser } from 'store';

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

type TState = {
  error: string;
};

export const Login: React.FC = () => {
  // Routes
  const navigate = useNavigate();

  // Hooks
  const { isAuthenticated, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectPage = searchParams.get('redirect') || '/dashboard/home';

  // States
  const [state, setState] = useState<TState>({
    error: '',
  });
  const { error } = state;

  // Stores
  const dispatch: AppDispatch = useDispatch();

  // Cookies
  const cookies = new Cookies();

  const [messageCreate, contextHolder] = message.useMessage();

  const onFinish: FormProps<FieldType>['onFinish'] = async values => {
    if (values.username && values.password) {
      try {
        const result = await checkAuthentication(values.username, values.password);
        messageCreate.open({
          type: 'success',
          content: <div className="z-10">Login successfully!</div>,
        });
        cookies.set('authToken', result.data, { path: '/', maxAge: 3600 * 24 * 7 });
        const currentUser = await getUserInfo();
        dispatch(setUser(currentUser.data));

        setState(prev => ({ ...prev, error: '' }));

        setTimeout(() => {
          navigate(redirectPage, { replace: true });
        }, 1000);
      } catch (error) {
        setState(prev => ({ ...prev, error: error as string }));
      }
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  if (isAuthenticated && !loading) {
    navigate('/dashboard/home');
  }

  return (
    <Row style={{ height: '100vh' }}>
      {contextHolder}
      <Col
        flex="550px"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        }}
      ></Col>
      <Col flex="auto" className="flex justify-center items-center h-full">
        <div className="flex flex-col">
          <div className="text-2xl font-bold mb-4">Sign in to your account </div>
          <div className="flex text-sm font-light mb-6">
            Don&apos;t have an account? &nbsp;
            <Link to="/signup" className="text-emerald-400 font-semibold">
              Sign up
            </Link>
          </div>
          <Form
            name="login"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ width: '560px' }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input className="p-2" placeholder="Input your email or phone number" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password className="p-2" placeholder="Input your password" />
            </Form.Item>
            <div className="text-red-500 mb-5">{error}</div>

            <Form.Item<FieldType> name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
};
