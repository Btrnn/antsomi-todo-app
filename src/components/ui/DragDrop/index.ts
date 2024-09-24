export type UniqueIdentifier = string | number;

type AnyData = Record<string, any>;
type Data<T = AnyData> = T & AnyData;
type CleanupFunction = () => void;
type MeasuringFunction = (node: HTMLElement) => ClientRect;
type DataRef<T = AnyData> = MutableRefObject<Data<T> | undefined>;
type DraggableNodes = Map<UniqueIdentifier, DraggableNode | undefined>;
type DraggableNode = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  node: MutableRefObject<HTMLElement | null>;
  activatorNode: MutableRefObject<HTMLElement | null>;
  data: DataRef;
};
type DroppableContainers = DroppableContainersMap;
type Identifier = UniqueIdentifier | null | undefined;
type DeepRequired<T> = {
  [K in keyof T]-?: Required<T[K]>;
};
type Styles = ExtractStringProperties<CSSStyleDeclaration>;
type ExtractStringProperties<T> = {
  [K in keyof T]?: T[K] extends string ? string : never;
};
type RectMap = Map<UniqueIdentifier, ClientRect>;
type Coordinates = {
  x: number;
  y: number;
};
interface Collision {
  id: UniqueIdentifier;
  data?: Data;
}

type CollisionDetection = (args: {
  active: Active;
  collisionRect: ClientRect;
  droppableRects: RectMap;
  droppableContainers: DroppableContainer[];
  pointerCoordinates: Coordinates | null;
}) => Collision[];

class DroppableContainersMap extends Map<UniqueIdentifier, DroppableContainer> {
  get(id: Identifier) {
    return id != null ? (super.get(id) ?? undefined) : undefined;
  }

  toArray(): DroppableContainer[] {
    return Array.from(this.values());
  }

  getEnabled(): DroppableContainer[] {
    return this.toArray().filter(({ disabled }) => !disabled);
  }

  getNodeFor(id: Identifier) {
    return this.get(id)?.node.current ?? undefined;
  }
}

interface DroppableContainer {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  data: DataRef;
  disabled: boolean;
  node: MutableRefObject<HTMLElement | null>;
  rect: MutableRefObject<ClientRect | null>;
}

interface MutableRefObject<T> {
  current: T;
}

interface Active {
  id: UniqueIdentifier;
  data: DataRef;
  rect: MutableRefObject<{
    initial: ClientRect | null;
    translated: ClientRect | null;
  }>;
}

interface DropAnimationSideEffectsParameters extends SharedParameters {}

interface Measuring {
  measure: MeasuringFunction;
}

enum MeasuringStrategy {
  Always,
  BeforeDragging,
  WhileDragging,
}

enum MeasuringFrequency {
  Optimized = 'optimized',
}

interface DroppableMeasuring {
  measure: MeasuringFunction;
  strategy: MeasuringStrategy;
  frequency: MeasuringFrequency | number;
}

type DropAnimationSideEffects = (
  parameters: DropAnimationSideEffectsParameters,
) => CleanupFunction | void;

export interface DraggableMeasuring extends Measuring {}

export interface DragOverlayMeasuring extends Measuring {}

export interface MeasuringConfiguration {
  draggable?: Partial<DraggableMeasuring>;
  droppable?: Partial<DroppableMeasuring>;
  dragOverlay?: Partial<DragOverlayMeasuring>;
}

interface ClientRect {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

interface SharedParameters {
  active: {
    id: UniqueIdentifier;
    data: Active['data'];
    node: HTMLElement;
    rect: ClientRect;
  };
  dragOverlay: {
    node: HTMLElement;
    rect: ClientRect;
  };
  draggableNodes: DraggableNodes;
  droppableContainers: DroppableContainers;
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
}

export interface KeyframeResolverParameters extends SharedParameters {
  transform: {
    initial: Transform;
    final: Transform;
  };
}

export type KeyframeResolver = (parameters: KeyframeResolverParameters) => Keyframe[];

export type Transform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

export interface DropAnimationOptions {
  keyframes?: KeyframeResolver;
  duration?: number;
  easing?: string;
  sideEffects?: DropAnimationSideEffects | null;
}

export type DropAnimation = DropAnimationFunction | DropAnimationOptions;

export interface DropAnimationFunctionArguments extends SharedParameters {
  transform: Transform;
}

export type DropAnimationFunction = (args: DropAnimationFunctionArguments) => Promise<void> | void;

interface DefaultDropAnimationSideEffectsOptions {
  className?: {
    active?: string;
    dragOverlay?: string;
  };
  styles?: {
    active?: Styles;
    dragOverlay?: Styles;
  };
}

export const defaultDropAnimationSideEffects =
  (options: DefaultDropAnimationSideEffectsOptions): DropAnimationSideEffects =>
  ({ active, dragOverlay }) => {
    const originalStyles: Record<string, string> = {};
    const { styles, className } = options;

    if (styles?.active) {
      for (const [key, value] of Object.entries(styles.active)) {
        if (value === undefined) {
          continue;
        }

        originalStyles[key] = active.node.style.getPropertyValue(key);
        active.node.style.setProperty(key, value);
      }
    }

    if (styles?.dragOverlay) {
      for (const [key, value] of Object.entries(styles.dragOverlay)) {
        if (value === undefined) {
          continue;
        }

        dragOverlay.node.style.setProperty(key, value);
      }
    }

    if (className?.active) {
      active.node.classList.add(className.active);
    }

    if (className?.dragOverlay) {
      dragOverlay.node.classList.add(className.dragOverlay);
    }

    return function cleanup() {
      for (const [key, value] of Object.entries(originalStyles)) {
        active.node.style.setProperty(key, value);
      }

      if (className?.active) {
        active.node.classList.remove(className.active);
      }
    };
  };
