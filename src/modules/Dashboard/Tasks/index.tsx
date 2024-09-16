// Libraries
import { nanoid } from 'nanoid'

// Icons
import {
  AddIcon,
  DeleteIcon,
  DoneIcon,
  FilterIcon,
  DragIcon,
  EditIcon,
} from "components/icons";

// Components
import {
  Button,
  Input,
  Select,
  Popconfirm,
  notification,
  FlexProps, 
  SegmentedProps,
  Flex,
  Tag,
  Modal,
  ColorPicker,
  Color
} from "components/ui";

// Constants
import { TASK_STATUS_KEY } from "../../../constants";

// Libraries
import React, { useState } from "react";
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import { useSelector, useDispatch } from 'react-redux';

// Providers
import { 
  RootState, 
  AppDispatch,
  addGroup, 
  updateGroup, 
  deleteGroup 
} from '../../../store';

// Models
import { Task } from "../../../models";
import { Group } from 'models/Group';
import { User } from 'models/User';

// Utils
import { reorder } from "utils";

// 
import { TaskList } from './components/TaskList';


interface TasksProp{}

interface GroupProps {
  id: any;
  groupTitle: string;
  type: string;
  tasks: Task[];
  onChangeName: [any, string];
  onRemove: any; 
}

export const Tasks:React.FC<TasksProp> = (props) => {
  
  // State
  const [state, setState] = useState({
    groupType: 0,
    groupTitle: "",
    tasks: [],
    error: "",
    groupList: [
      {id: 0, title: 'Status'},
      {id: 1, title: 'Assignee'},
      {id: 2, title: 'Priority'}
    ]
  })

  const onChangeGroupType = (value: any) => {
    setState(prev => ({...prev, groupType: value}))
  }

  return (
    <div>
      <Select
        defaultValue="Status"
        className="w-28 h-9"
        onChange={onChangeGroupType}
        suffixIcon={<FilterIcon className="h-5" />}
        options = {state.groupList.map(group => ({
          value: group.id,  
          label: group.title   
        }))}
      />
      <Groups
        id = {state.groupType} 
        groupTitle = {""}
        type = {''}
        tasks = {[]}
        onChangeName = {[1,'']}
        onRemove = {''}
      />
    </div>
  )
}


export const Groups: React.FC<GroupProps> = (props) => {
  const {id, groupTitle, type, tasks, onChangeName, onRemove} = (props);


  // Store
  const dispatch: AppDispatch = useDispatch();
  const groupList = useSelector((state: RootState) => state.group.groupList);

  // State
  const [state, setState] = useState({
    groupType: groupTitle,
    tasks: [],
    error: "",
    inputGroupName: "",
  })


  // Handlers
  const onChangeInputGroup = (event: any) => {
    setState(prev => ({ ...prev, inputGroupName: event.target.value }))
  };


  const onClickAddGroup = () => {
    const newGroup = { name: state.inputGroupName, type: type};
    dispatch(addGroup(newGroup));
  };

  const onChangeSetColor = (value: Color, index: number) =>{
    if (typeof value === 'string') 
      dispatch(updateGroup({id: index, updatedGroup: {color: value}}))
    else if (value && 'toHexString' in value) 
      dispatch(updateGroup({id: index, updatedGroup: {color: value.toHexString()}}))
    else
      dispatch(updateGroup({id: index, updatedGroup: {color: '#ffff'}}))
  }


  return(
    <Flex justify='space-between' align={'flex-start'} className='gap-5 overflow-x-auto w-full flex-shrink-0'>
      <div className="flex gap-1 mt-11 flex-shrink-0 w-1/5">
        <Input
            className="p-2"
            placeholder="Add new group"
            value={state.inputGroupName}
            onChange={onChangeInputGroup}
        />
        <Button className="w-9 h-9" onClick={onClickAddGroup}>
            <AddIcon />
        </Button>
      </div>
      {groupList.map((group, index) =>{
        return (
          <div key={index} className='flex-shrink-0 w-1/5'>
            <ColorPicker trigger="hover" onChange={(value) => onChangeSetColor(value, index)}>
              <Tag bordered ={false} color= {group.color}>
                {group.name}
              </Tag>
            </ColorPicker>
            <TaskList
              groupInfo = {group}
            />
          </div>
        )
      })}
    </Flex>
  )

};




