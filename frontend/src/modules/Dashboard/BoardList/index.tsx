// Libraries
import React from 'react';
import { NavLink } from 'react-router-dom';

// Icons

// Stores

// Components
import { List } from 'components/ui';
import { useBoardList } from 'hooks';

export const BoardList: React.FC = () => {
  //   const params = useParams();

  // Hooks
  const { owned: ownedBoardList, shared: sharedBoardList } = useBoardList();

  return (
    <div className="flex flex-col w-full h-full">
      {/* <div className="flex text-xl">Your boards</div> */}
      <List
        header={<span className="font-bold text-lg">Your Boards</span>}
        itemLayout="horizontal"
        dataSource={ownedBoardList}
        renderItem={(item, index) => (
          <List.Item className="flex h-full overflow-auto align-top">
            <List.Item.Meta
              title={<NavLink to={`/dashboard/board/${item.id}`}>{item.name}</NavLink>}
              description={<>{item.owner_id}</>}
            />
          </List.Item>
        )}
      />
      <List
        header={<span className="font-bold text-lg mt-4">Shared with you</span>}
        className="overflow-auto"
        itemLayout="horizontal"
        dataSource={sharedBoardList}
        renderItem={(item, index) => (
          <List.Item className="h-full overflow-auto">
            <List.Item.Meta
              title={<NavLink to={`/dashboard/board/${item.id}`}>{item.name}</NavLink>}
              description={<>{item.owner_id}</>}
            />
          </List.Item>
        )}
      />
    </div>
  );
};
