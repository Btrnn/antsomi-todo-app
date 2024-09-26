// Libraries
import React from 'react';
import { Link } from 'react-router-dom';

// Components
import { Button, Input, Checkbox, Form, type FormProps, Col, Row } from 'components/ui';

// Images
import image from 'assets/images/background.jpg';

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = values => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
  console.log('Failed:', errorInfo);
};

export const Login: React.FC = () => {
  return (
    <Row style={{ height: '100vh' }}>
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
              <Input className="p-2" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password className="p-2" />
            </Form.Item>

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
