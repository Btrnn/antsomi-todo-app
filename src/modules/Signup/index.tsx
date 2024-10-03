// Libraries
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

// Components
import {
  Button,
  Checkbox,
  Layout,
  Form,
  Input,
  Card,
  Upload,
  Flex,
  Row,
  Col,
  Breadcrumb,
  UploadProps,
  GetProp,
} from 'components/ui';
import {
  SettingIcon,
  UserIcon,
  ImageIcon,
  PhoneIcon,
  LockIcon,
  LockConfirmIcon,
  EmailIcon,
  BackIcon,
} from 'components/icons';

// Constants
import { globalToken } from '../../constants';

// Services
import { createUser } from 'services/user';

// const { Option } = Select;
const { Header, Content } = Layout;
const { colorBgContainer } = globalToken;

interface SignupProps {}
interface DataNodeType {
  value: string;
  label: string;
  children?: DataNodeType[];
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

export const Signup: React.FC<SignupProps> = props => {
  const { ...restProps } = props;

  // Routes
  const navigate = useNavigate();

  // States
  const [state, setState] = useState({
    isPreviewOpen: false,
    previewImage: '',
  });
  const { isPreviewOpen, previewImage } = state;

  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const result = await createUser({
      email: values.email,
      name: values.name,
      password: values.password,
      phone_number: values.phone,
    });
    console.log(result);
    navigate('/login');
  };

  const onClickBack = () => {
    navigate(-1);
  };

  // const prefixSelector = (
  //   <Form.Item name="prefix">
  //     <Select style={{ height: '7vh', width: 70, fontSize: '1vh' }}>
  //       <Option value="86">+86</Option>
  //       <Option value="87">+87</Option>
  //       <Option value="84">+84</Option>
  //     </Select>
  //   </Form.Item>
  // );

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Layout className="overflow-hidden">
      <Header
        className="flex items-center"
        style={{ padding: 20, background: colorBgContainer, height: '7vh' }}
      >
        <div className="flex items-center justify-between" style={{ width: '100%' }}>
          <div style={{ justifyContent: 'flex-start', marginLeft: '2px' }}>
            <BackIcon
              className="mr-4"
              style={{ fontSize: '22px', cursor: 'pointer' }}
              onClick={onClickBack}
            />
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <SettingIcon className="mr-4" style={{ fontSize: '22px', cursor: 'pointer' }} />
          </div>
        </div>
      </Header>
      <Content
        style={{ height: '93vh', width: '100vw', background: colorBgContainer, overflow: 'auto' }}
      >
        <div className="ml-9 mb-5">
          <div className=" font-black text-[35px] align-bottom ml-[3vw]">Sign Up</div>
          <Breadcrumb
            items={[{ title: 'Home' }, { title: 'Sign Up' }]}
            className="mt-5 text-[15px] ml-[3vw]"
          />
        </div>
        <Form
          {...formItemLayout}
          form={form}
          name="register"
          onFinish={onFinish}
          initialValues={{ prefix: '84' }}
          scrollToFirstError
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Flex gap="5vw" vertical={false} style={{ height: '50vh' }}>
            <Card
              style={{
                width: '20vw',
                boxShadow: '0 5px 1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'auto',
              }}
            >
              <Form.Item valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload action="/upload.do" listType="picture-card" style={{ width: '100vw' }}>
                  <button style={{ border: 0, background: 'none', width: '100vw' }} type="button">
                    <ImageIcon />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </button>
                </Upload>
              </Form.Item>
            </Card>
            <Card
              style={{
                width: '65vw',
                boxShadow: '0 5px 1px rgba(0, 0, 0, 0.1)',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Row
                style={{
                  justifyContent: 'center',
                  width: '60vw',
                  padding: '20px',
                }}
                gutter={[16, 16]}
              >
                <Col span={12} xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    rules={[
                      { required: true, message: 'Please input your name!', whitespace: true },
                    ]}
                  >
                    <Input
                      prefix={<UserIcon className="mr-2" />}
                      placeholder="Full name"
                      style={{ height: '60px', width: '350px', fontSize: '16px' }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                      },
                      {
                        required: true,
                        message: 'Please input your E-mail!',
                      },
                    ]}
                  >
                    <Input
                      prefix={<EmailIcon className="mr-2" />}
                      placeholder="Email Address"
                      style={{ height: '60px', width: '350px', fontSize: '16px' }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    rules={[{ required: true, message: 'Please input your phone number!' }]}
                  >
                    <Input
                      prefix={<PhoneIcon className="mr-2" />}
                      //addonBefore={prefixSelector}
                      style={{ height: '60px', width: '350px', fontSize: '16px' }}
                      placeholder="Phone Number"
                    />
                  </Form.Item>
                </Col>
                <Col span={12} xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your password!',
                      },
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<LockIcon className="mr-2" />}
                      placeholder="Password"
                      style={{ height: '60px', width: '350px', fontSize: '16px' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: 'Please confirm your password!',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('The new password that you entered do not match!'),
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockConfirmIcon className="mr-2" />}
                      placeholder="Confirm password"
                      style={{ height: '60px', width: '350px', fontSize: '16px' }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(new Error('Should accept agreement')),
                      },
                    ]}
                    {...tailFormItemLayout}
                  >
                    <Checkbox
                      style={{
                        height: '60px',
                        width: '250px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                      }}
                    >
                      I have read the <a href="/agreement">agreement</a>
                    </Checkbox>
                  </Form.Item>
                  <Form.Item {...tailFormItemLayout}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        height: '40px',
                        width: '200px',
                        fontSize: '16px',
                        display: 'flex',
                        justifyItems: 'flex-end',
                      }}
                    >
                      Register
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Flex>
        </Form>
      </Content>
    </Layout>
  );
};
