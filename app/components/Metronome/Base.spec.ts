import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Base from "./Base.vue";
import { defu } from 'defu';
import type { Metronome } from "~/types";

describe('MetronomeBase', () => {
    const mountComponent = (overrides: Parameters<typeof shallowMount<typeof Base>>[1] = {}) => shallowMount(Base, defu(overrides, {
        props: {
            modelValue: {
                configuration: {
                    title: "Test Metronome",
                    bpm: 0,
                    timeSignature: [0,0],
                    style: {
                        id: 'rectangle',
                        colorBackground: "#ffffff",
                    }},
            } as Metronome,
        },
        global: {},
        slots: {
            default: { template: "<div/>" },
        },
    }));

    it('has a named Tailwind group "metronome-base" at the top level', () => {
        const wrapper = mountComponent();
        expect(wrapper.classes()).includes('group/metronome-base');
    });

    it('has relative positioning so children can use absolute positioning', () => {
        const wrapper = mountComponent();
        expect(wrapper.classes()).includes('relative');
    });
    
    describe('quick setting buttons area', () => {
        it('exists', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').exists()).toBe(true);
        });
        
        it('is opacity-50 by default', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes('opacity-50');
        });
        
        it("is grayscale by default so that icons like the color background icon don't display their colors until the user is interacting with these controls to reduce distractions", () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes('grayscale-100');
        });
        
        it('goes to 100% opacity on hover', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes('group-hover/metronome-base:opacity-100');
        });
        
        it('goes to 100% opacity when it has focus', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes('has-focus-within:opacity-100');
        });
        
        it('goes to 100% opacity when any setting is expanded', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes(`has-[[aria-expanded='true']]:opacity-100`);
        });

        it('removes the grayscale effect on hover', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes(`group-hover/metronome-base:grayscale-0`);
        });

        it('removes the grayscale effect when it has focus', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes(`has-focus-within:grayscale-0`);
        });

        it('removes the grayscale effect when any setting is expanded', () => {
            const wrapper = mountComponent();
            expect(wrapper.find('[data-quick-setting-buttons-container]').classes()).includes(`has-[[aria-expanded='true']]:grayscale-0`);
        });
    });
});