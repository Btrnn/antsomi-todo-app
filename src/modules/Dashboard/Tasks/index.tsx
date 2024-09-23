// Libraries
import React, { useState } from "react";


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
  Select,
} from "components/ui";

// Models
import { Groups } from './components/GroupList';


interface TasksProp{}


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
    console.log(value)
  }

  return (
    <div>
      <Select
        defaultValue="Status"
        className="w-28 h-9 mb-2"
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
      />
    </div>
  )
}







