import type { ColorPickerProps, GetProp } from 'antd';

export type Color = Extract<GetProp<ColorPickerProps, 'value'>, string | { cleared: any }>;
export { ColorPicker } from 'antd';
