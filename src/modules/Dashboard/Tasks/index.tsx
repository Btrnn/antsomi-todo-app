// Libraries
import React /* , { useState } */ from 'react';

// Models
import { GroupList } from './components/GroupList';

export const Tasks: React.FC = () => {
  return (
    <div className="bg-inherit">
      {/* <Select
        defaultValue="Status"
        className="w-28 h-9 mb-2"
        onChange={onChangeGroupType}
        suffixIcon={<FilterIcon className="h-5" />}
        options={state.groupList.map(group => ({
          value: group.id,
          label: group.title,
        }))}
      /> */}
      <GroupList id={0} type={'status'} />
    </div>
  );
};
