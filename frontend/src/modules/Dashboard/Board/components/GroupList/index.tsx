// Libraries
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  rectIntersection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useOutletContext } from "react-router-dom";

// Icons
import { AddIcon } from "components/icons";

// Components
import { Button, Input, Flex, message } from "components/ui";
import { TaskItem } from "../TaskItem";
import { GroupItem } from "../GroupItem";

// Providers
import {
  RootState,
  AppDispatch,
  reorderTask,
  reorderGroup,
  setGroupList,
  deleteGroup,
  setTaskList,
  reorderTaskAsync,
  reorderGroupAsync,
} from "store";

// Constants
import { SORTABLE_TYPE } from "constants/tasks";
import { PERMISSION, ROLE_KEY } from "constants/role";

// Services
import {
  createGroup,
  deleteGroup as deleteGroupAPI,
  getGroupList as getGroupListAPI,
} from "services/group";
import { getAllTasks, updateTask as updatedTaskAPI } from "services/task";

// Models
import { Group } from "models";
import { Task } from "models";

// Utils
import { checkAuthority, getContrastTextColor } from "utils";

interface GroupsProps {
  type: string;
  permission: string;
  boardId: React.Key;
}

type TState = {
  error: string;
  inputGroupName: string;
  activeID: React.Key | null | undefined;
  activeType: string | null | undefined;
  tempTaskList: Task[];
  activeInfo: Group | undefined;
};

type OutletContextType = {
  height: number;
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export const GroupList: React.FC<GroupsProps> = (props) => {
  const { type, boardId, permission } = props;
  const sensors = useSensors(useSensor(MouseSensor));

  const [messageCreate, contextHolder] = message.useMessage();

  // State
  const [state, setState] = useState<TState>({
    error: "",
    inputGroupName: "",
    activeID: null,
    activeType: null,
    tempTaskList: [],
    activeInfo: undefined,
  });

  const { activeID, activeType, inputGroupName, tempTaskList, activeInfo } =
    state;

  // Store
  const dispatch: AppDispatch = useDispatch();
  const groupList = useSelector((state: RootState) => state.group.groupList);
  const taskList = useSelector((state: RootState) => state.task.taskList);

  // Use Effect
  useEffect(() => {
    getGroupList();
    getTaskList();
  }, [boardId]);

  // Handlers
  const getGroupList = async () => {
    try {
      const fetchedGroups = await getGroupListAPI(boardId);
      dispatch(setGroupList(fetchedGroups?.data));
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeInputGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, inputGroupName: event.target.value }));
  };

  const onClickAddGroup = async () => {
    try {
      const newGroup: Partial<Group> = {
        name: inputGroupName,
        position: groupList.length,
        type: type,
        color: "#597ef7",
        board_id: boardId,
      };
      const createdGroup = await createGroup(boardId, newGroup);
      messageCreate.open({
        type: "success",
        content: <div className="z-10">New group added!</div>,
      });
      getGroupList();
    } catch (error) {
      messageCreate.open({
        type: "error",
        content: error as string,
      });
    }
    setState((prev) => ({ ...prev, inputGroupName: "" }));
  };

  const onDragStart = (event: DragStartEvent) => {
    let currentInfo;
    if (event.active.data.current?.type === SORTABLE_TYPE.TASK) {
      currentInfo = groupList.find(
        (group) => group.id === event.active.data.current?.groupID
      );
    }
    setState((prev) => ({
      ...prev,
      activeID: event.active?.id,
      activeType: event.active.data.current?.type,
      tempTaskList: taskList,
      activeInfo: currentInfo,
    }));
  };

  const onDragCancel = () => {
    setState((prev) => ({
      ...prev,
      activeID: null,
      activeType: null,
      tempTaskList: [],
    }));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const source = active.data.current;

    if (source?.type === SORTABLE_TYPE.TASK) {
      dispatch(reorderTask({ source: active, destination: over }));
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const sourceType = active.data.current?.type;

    if (!over) {
      return;
    }

    if (sourceType === SORTABLE_TYPE.TASK) {
      dispatch(reorderTask({ source: active, destination: over }));
      try {
        if (over.data.current?.type === SORTABLE_TYPE.GROUP) {
          updatedTaskAPI(boardId , { id: active.id, status_id: over.id });
        } else {
          updatedTaskAPI(boardId, {id: active.id, status_id: over.data.current?.groupID });
        }
        dispatch(reorderTaskAsync(boardId));
      } catch (error) {
        messageCreate.open({
          type: "error",
          content: error as string,
        });
      }
    } else if (sourceType === SORTABLE_TYPE.GROUP) {
      console.log("Group");
      dispatch(reorderGroup({ source: active, destination: over }));
      try {
        dispatch(reorderGroupAsync(boardId));
      } catch (error) {
        messageCreate.open({
          type: "error",
          content: error as string,
        });
      }
    }
    setState((prev) => ({
      ...prev,
      activeID: null,
      activeType: null,
      tempTaskList: [],
      activeInfo: undefined,
    }));
  };

  const onDeleteGroup = async (id: React.Key) => {
    try {
      const deletedGroup = await deleteGroupAPI(boardId, id);
      getGroupList();
      dispatch(deleteGroup({id}));
      dispatch(reorderGroupAsync(boardId));
      messageCreate.open({
        type: "success",
        content: <div className="z-10">Group deleted!</div>,
      });
    } catch (error) {
      messageCreate.open({
        type: "error",
        content: error as string,
      });
    }
  };

  const getTaskList = async () => {
    try {
      const fetchedTasks = await getAllTasks(boardId);
      dispatch(setTaskList(fetchedTasks.data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      collisionDetection={rectIntersection}
      onDragCancel={onDragCancel}
      onDragOver={onDragOver}
    >
      {contextHolder}
      <Flex
        justify="flex-start"
        align={"flex-start"}
        className="gap-5 w-full h-full"
      >
        <SortableContext
          items={groupList.map((group) => String(group.id))}
          strategy={horizontalListSortingStrategy}
        >
          {groupList?.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              allTasks={taskList}
              onDelete={onDeleteGroup}
              isOverlay={false}
              isRearrange={activeID != null}
              boardId={boardId}
              permission={permission}
            />
          ))}
        </SortableContext>
        { checkAuthority(permission, PERMISSION.EDIT) &&
        <div className="flex gap-1 flex-shrink-0 w-[280px]">
          <Input
            className="p-2"
            style={{
              outline: "none",
              boxShadow: "none",
            }}
            placeholder="Add new group"
            value={inputGroupName}
            onChange={onChangeInputGroup}
            onPressEnter={onClickAddGroup}
          />
          <Button className="w-10 h-10" onClick={onClickAddGroup}>
            <AddIcon />
          </Button>
        </div>
        }
      </Flex>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeID ? (
          activeType === SORTABLE_TYPE.TASK ? (
            activeInfo && (
              <TaskItem
                task={taskList.find((task) => task.id === activeID)}
                onClickShowDetail={() => {}}
                groupInfo={{
                  groupColor: activeInfo.color,
                  groupID: activeInfo.id,
                  groupName: activeInfo.name,
                  textColor: getContrastTextColor(activeInfo.color),
                }}
                isOverlay={true}
                onDelete={async () => {}}
                permission={permission}
              />
            )
          ) : (
            <GroupItem
              group={groupList.find((group) => group.id === activeID)}
              allTasks={taskList}
              onDelete={async () => {}}
              isOverlay={true}
              isRearrange={false}
              boardId={''}
              permission={permission}
            />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
