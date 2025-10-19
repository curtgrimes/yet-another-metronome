<script setup lang="ts">
import { useMetronomes } from '~/composables/useMetronomes';
import { Metronome } from '#components';
import 'gridstack/dist/gridstack.min.css';
import { GridStack, type GridStackPosition } from 'gridstack';
import {  useElementBounding, watchArray, whenever } from '@vueuse/core';

const { metronomes } = useMetronomes();

const { appMode } = useSettings();

const metronomeEls = ref<HTMLDivElement[]>();

const gridContainer = useTemplateRef('grid-container');

const grid = shallowRef<GridStack>();

const draggingOrResizing = ref(false);

const ROW_COUNT = 7;
const COLUMN_COUNT = 12;

const { height } = useElementBounding(gridContainer);
const cellHeight = computed(() => height.value / ROW_COUNT);

whenever(gridContainer, (newGridContainer) => {
    grid.value = GridStack.init({
        sizeToContent: false,
        row: ROW_COUNT,
        column: COLUMN_COUNT,
        cellHeight: cellHeight.value,
        columnOpts: {
            layout: 'list',
            breakpoints: [
                // Match the Tailwind defaults:
                // https://tailwindcss.com/docs/responsive-design
                { w: 640, c:2}, // sm
                { w: 768, c:3}, // md
                { w: 1024, c:7}, // lg 
                { w: 1280, c:COLUMN_COUNT}, // xl
            ],
        },

        // Always show the resize handles but use some CSS below to hides these
        // initially and fade them in on hover.
        alwaysShowResizeHandle: true,

        float: true,

        resizable: {
            handles: 'ne,se,sw,nw',
        },
    }, newGridContainer);



    grid.value.on('dragstart resizestart', () => {
        draggingOrResizing.value = true;
    });

    grid.value.on('dragstop resizestop', () => {
        draggingOrResizing.value = false;
    });
});

watch(appMode, (newAppMode) => {
    if (newAppMode === 'edit') {
        grid.value?.enable();
    }
    else {
        grid.value?.disable();
    }
});

watch(cellHeight, () => {
    grid.value?.updateOptions({
        cellHeight: cellHeight.value,
        // cellHeight: 'initial',
    });
});

let stopMetronomeElsWatcher: ReturnType<typeof watchArray>;
watch(grid, (_grid) => {
    if (_grid) {
        if (stopMetronomeElsWatcher) {
            stopMetronomeElsWatcher();
        }

        stopMetronomeElsWatcher = watchArray(
            () => metronomeEls.value || [],
            (newList, oldList, added, removed) => {
                // Metronomes were added or removed. Sync up the gridstack widget
                // states by adding or removing widgets as necessary:

                added.forEach(_addedMetronomeEl => {

                    const COLUMN_COUNT = _grid.getColumn();
                    const ROW_COUNT = _grid.getRow();

                    const gridStackPosition: GridStackPosition = {
                        x: Math.floor((COLUMN_COUNT - Math.floor(COLUMN_COUNT / 2)) / 2),
                        y: Math.floor((ROW_COUNT - Math.floor(ROW_COUNT / 2)) / 3),
                        w: Math.max(1, Math.floor(COLUMN_COUNT / 2)),
                        h: Math.max(1, Math.floor(ROW_COUNT / 1.5)),
                    };

                    _grid.makeWidget(_addedMetronomeEl, 
                        _grid.isAreaEmpty(
                        gridStackPosition.x!,
                        gridStackPosition.y!,
                        gridStackPosition.w!,
                        gridStackPosition.h!,
                        ) ? gridStackPosition : {
                                w: 2,
                                h: 2,
                            },
                    );
                });

                (removed || []).forEach(_removedMetronomeEL => {
                    _grid.removeWidget(_removedMetronomeEL);
                });

            }, 
            {
                deep: true,
                immediate: true,
            },
        );
    }
});
</script>

<template>
    <div
        ref="grid-container" 
        :data-dragging-or-resizing="draggingOrResizing"
        :class="`
            !h-full
            overflow-y-auto
            relative
            m-2
            rounded-3xl
            group
        `"
    >
        <!-- Background -->
        <div
            class="
                absolute
                inset-0
                rounded-3xl 
                border-[var(--ui-bg-elevated)]
                border
                bg-grid
                transition-all
                duration-250
                opacity-0
                group-data-[dragging-or-resizing=true]:opacity-100
            "
        />
        <div
            v-for="(metronome, index) in metronomes"
            :key="index"
            ref="metronomeEls"
        >
            <component
                :is="metronome.state.visibleInMainView ? Metronome : 'div'"
                v-model="metronomes[index]"
                class="p-2"
                :class="appMode === 'edit' && 'cursor-move'"
                :show-controls="appMode === 'edit'"
            />
        </div>
    </div>
</template>

<style lang="css">
@reference "~/assets/css/main.css";

.placeholder-content {
    @apply !rounded-2xl !bg-(--ui-bg) border border-(--ui-bg-accented);
}

.grid-stack-item {
    container-type: size;
    @apply min-h-12;
}

.ui-resizable-handle {
    opacity: 0;
    transition: all 250ms ease-out;
    --resize-handle-offset: 0px;
    --resize-handle-scale: 1;

    /* Cut out a little "corner notch" so that clickable buttons near the
    corners can be interacted with instead of having the resize control blocking
    them. */
    --notch: 45%;
}

/* Have a slightly different appearance with smaller controls when the grid item
approaches a small size: */
@container (height < 100px) or (width < 200px) {
    .ui-resizable-handle {
        --resize-handle-offset: -4px;
        --resize-handle-scale: 0.5;
        --notch: 65%;
    }

    .grid-stack-item:hover .ui-resizable-handle {
        --resize-handle-offset: -8px !important;
        --resize-handle-scale: 0.65;
    }
}

.grid-stack-item:hover .ui-resizable-handle {
    opacity: 0.5;
    --resize-handle-offset: -6px;
}

.ui-resizable-resizing .ui-resizable-handle:not(.ui-resizable-handle:hover) {
    /* Hide the other handles when dragging one of them */
    opacity: 0;
}

.ui-resizable-handle:hover {
    opacity: 1 !important;
}

.ui-resizable-handle.ui-resizable-ne {
    cursor: nesw-resize;
    --gs-item-margin-top: var(--resize-handle-offset);
    --gs-item-margin-right: var(--resize-handle-offset);
    transform: rotate(-90deg) scale(var(--resize-handle-scale)) !important;
}
.ui-resizable-handle.ui-resizable-se {
    cursor: nwse-resize;
    --gs-item-margin-bottom: var(--resize-handle-offset);
    --gs-item-margin-right: var(--resize-handle-offset);
    transform: rotate(0) scale(var(--resize-handle-scale)) !important;
}
.ui-resizable-handle.ui-resizable-sw {
    cursor: nesw-resize;
    --gs-item-margin-bottom: var(--resize-handle-offset);
    --gs-item-margin-left: var(--resize-handle-offset);
    transform: rotate(90deg) scale(var(--resize-handle-scale)) !important;
}
.ui-resizable-handle.ui-resizable-nw {
    cursor: nwse-resize;
    --gs-item-margin-top: var(--resize-handle-offset);
    --gs-item-margin-left: var(--resize-handle-offset);
    transform: rotate(180deg) scale(var(--resize-handle-scale)) !important;
}

.ui-resizable-handle {
    content: '';

    clip-path: polygon(
        var(--notch) 0%,    /* top edge, 40% across */
        100% 0%,   /* top-right corner */
        100% 100%, /* bottom-right corner */
        0%   100%, /* bottom-left corner */
        0%   var(--notch),  /* left edge, 40% down */
        var(--notch) var(--notch)    /* notch corner */
    );
    position: absolute;

    width: 50px !important;
    height: 50px !important;

    /* Override the Draggable library's default resize indicator with a
    different 90 rounded degree corner shape design: */
    background:
      no-repeat 50% 50% / 100% 100%
      url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' preserveAspectRatio='none'>\
  <path d='M80,180 A120,120 0 0 0 180,80' fill='none' stroke='%237779' stroke-width='24' stroke-linecap='round'/>\
</svg>") !important;
}

.ui-resizable-handle:after {
    content: '';
    width: 20px;
    height: 20px;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
}
</style>