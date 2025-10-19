import { UButton, UPopover, UTooltip } from '#components';
import { shallowMount } from '@vue/test-utils';
import { defu } from 'defu';
import { describe, expect, it } from 'vitest';
import QuickSettingButton from './QuickSettingButton.vue';

describe('quickSettingButton', () => {
  const mountComponent = (overrides: Parameters<typeof shallowMount<typeof QuickSettingButton>>[1] = {}) => shallowMount(QuickSettingButton, defu(overrides, {
    global: {
      stubs: {
        UPopover: {
          template: '<div><slot /></div>',
          props: ['content'],
        },
        UTooltip: {
          template: '<div><slot /></div>',
          props: ['text'],
        },
      },
    },
    slots: {
      default: { template: '<div/>' },
    },
  }));

  describe('popover', () => {
    it('displays right + center by default', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(UPopover).props()).toEqual(
        {
          content: {
            align: 'center',
            side: 'right',
          },
        },
      );
    });

    it('can be overwritten with the popoverProps prop', () => {
      const wrapper = mountComponent({
        props: {
          popoverProps: {
            content: {
              side: 'left',
              align: 'start',
            },
          },
        },
      });

      expect(wrapper.findComponent(UPopover).props()).toEqual(
        {
          content: {
            align: 'start',
            side: 'left',
          },
        },
      );
    });
  });

  describe('tooltip', () => {
    it('has the given text', () => {
      const wrapper = mountComponent({
        props: {
          tooltip: 'Hello World Test',
        },
      });
      expect(wrapper.findComponent(UTooltip).props('text')).toBe('Hello World Test');
    });
  });

  describe('button', () => {
    it('displays square', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(UButton).classes()).toContain('aspect-square');
    });

    it('shows the correct appearance on hover', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(UButton).classes()).toContain('hover:bg-default');
      expect(wrapper.findComponent(UButton).classes()).toContain('hover:!text-(--ui-text)');
    });

    it('shows the same hover appearance on keyboard focus', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(UButton).classes()).toContain('focus-visible:bg-default');
      expect(wrapper.findComponent(UButton).classes()).toContain('focus-visible:!text-(--ui-text)');
    });

    it('forces the default background and 100% opacity when the popover is open', () => {
      const wrapper = mountComponent({
        global: {
          stubs: {
            UPopover: {
              template: '<slot :open="true" />',
            },
          },
        },
      });

      expect(wrapper.findComponent(UButton).classes()).toContain('!bg-default');
      expect(wrapper.findComponent(UButton).classes()).toContain('opacity-100');
    });

    it('centers the content', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(UButton).classes()).toContain('flex');
      expect(wrapper.findComponent(UButton).classes()).toContain('items-center');
      expect(wrapper.findComponent(UButton).classes()).toContain('justify-center');
    });
  });
});
