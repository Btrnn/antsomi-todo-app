// Libraries
import React, { useState } from "react";
import {
  DndContext,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const SortableItem = (id: any) => {
  return (
    <div
      style={{
        padding: "8px",
        margin: "4px",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
      }}
    >
      {id}
    </div>
  );
};


// Component để hiển thị từng item
// const SortableItem = SortableElement(({ item }) => (
//   <div style={{ padding: "10px", border: "1px solid #ccc", margin: "5px" }}>
//     {item}
//   </div>
// ));

// // Component để hiển thị danh sách item
// const SortableList = SortableContainer(({ items }) => {
//   return (
//     <div>
//       {items.map((item, index) => (
//         <SortableItem key={`item-${index}`} index={index} item={item} />
//       ))}
//     </div>
//   );
// });

interface AboutProps {}

export const About: React.FC<AboutProps> = (props: any) => {
  const [container1Items, setContainer1Items] = useState([
    "Item 1",
    "Item 2",
    "Item 3",
  ]);
  const [container2Items, setContainer2Items] = useState(["Item A", "Item B"]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    // Nếu không có item nào được thả
    if (!over) return;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current.sortable.containerId;

    // Xử lý việc di chuyển giữa các container
    if (activeContainer !== overContainer) {
      // Xóa item khỏi container hiện tại
      if (activeContainer === "container1") {
        setContainer1Items((items) =>
          items.filter((item) => item !== active.id)
        );
        setContainer2Items((items) => [...items, active.id]);
      } else {
        setContainer2Items((items) =>
          items.filter((item) => item !== active.id)
        );
        setContainer1Items((items) => [...items, active.id]);
      }
    }
  };

  return <div>About</div>

  // return (
  //   <DndContext onDragEnd={handleDragEnd}>
  //     <div style={{ display: "flex", gap: "20px" }}>
  //       <SortableContext
  //         id="container1"
  //         items={container1Items}
  //         strategy={verticalListSortingStrategy}
  //       >
  //         <div>
  //           <h3>Container 1</h3>
  //           {container1Items.map((item) => (
  //             <SortableItem key={item} id={item} />
  //           ))}
  //         </div>
  //       </SortableContext>

  //       <SortableContext
  //         id="container2"
  //         items={container2Items}
  //         strategy={verticalListSortingStrategy}
  //       >
  //         <div>
  //           <h3>Container 2</h3>
  //           {container2Items.map((item) => (
  //             <SortableItem key={item} id={item} />
  //           ))}
  //         </div>
  //       </SortableContext>
  //     </div>
  //   </DndContext>
  // );
};

