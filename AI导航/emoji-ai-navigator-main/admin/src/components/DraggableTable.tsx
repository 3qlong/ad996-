/**
 * DraggableTable - wraps Ant Design Table with @dnd-kit drag-and-drop row sorting.
 * Usage: pass `onSortEnd(newItems)` to receive the reordered array.
 */
import type { ReactNode } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRowProps {
  id: string | number;
  children?: ReactNode;
  [key: string]: any;
}

function SortableRow({ id, children, ...props }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <tr
      ref={setNodeRef}
      {...props}
      style={{
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        background: isDragging ? '#f6ffed' : undefined,
      }}
    >
      {/* Inject drag handle into first cell via children */}
      {children}
    </tr>
  );
}

interface DraggableTableProps<T extends { id: number }> extends Omit<TableProps<T>, 'components'> {
  dataSource: T[];
  onSortEnd: (newItems: T[]) => void;
  showHandle?: boolean;
}

export function DragHandle({ listeners, attributes }: any) {
  return (
    <span
      className="drag-handle"
      title="拖拽排序"
      style={{ touchAction: 'none', display: 'inline-flex', alignItems: 'center' }}
      {...listeners}
      {...attributes}
    >
      <HolderOutlined style={{ fontSize: 16 }} />
    </span>
  );
}

export default function DraggableTable<T extends { id: number }>({
  dataSource,
  onSortEnd,
  ...tableProps
}: DraggableTableProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIdx = dataSource.findIndex(i => i.id === active.id);
    const newIdx = dataSource.findIndex(i => i.id === over.id);
    onSortEnd(arrayMove(dataSource, oldIdx, newIdx));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={dataSource.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <Table
          {...tableProps}
          dataSource={dataSource}
          rowKey="id"
          components={{
            body: {
              row: (props: any) => {
                const id = props['data-row-key'];
                return <SortableRow id={Number(id)} {...props} />;
              },
            },
          }}
        />
      </SortableContext>
    </DndContext>
  );
}
