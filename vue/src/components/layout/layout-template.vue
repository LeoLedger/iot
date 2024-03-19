<template>
    <layout-container :height="height" :loading="loading">
        <layout-row>
            <slot name="top"/>
        </layout-row>
        <layout-row auto>
            <layout-col>
                <slot name="left"/>
            </layout-col>
            <layout-col auto>
                <layout-box padding-bottom="10px">
                    <layout-filter
                        :filter-model="filterModel"
                        :filter-button="filterButton"
                        :table-columns="tableColumns"
                        @update:filterModel="res => $emit('update:filterModel', res)"
                        @update:filterButton="res => $emit('update:filterButton', res)"
                        @update:tableColumns="res => $emit('update:tableColumns', res)"
                        @search="$emit('search')"
                    >
                        <slot slot="filter-top" name="filter-top" />
                        <slot slot="button" name="button"/>
                        <slot slot="filter" name="filter"/>
                        <slot slot="table" name="table"/>
                        <slot slot="filter-popup" name="filter-popup"/>
                    </layout-filter>
                </layout-box>
            </layout-col>
            <layout-col>
                <slot name="right"/>
            </layout-col>
        </layout-row>
        <layout-row>
            <slot name="bottom"/>
        </layout-row>
        <div style="height:0">
            <slot/>
        </div>
    </layout-container>
</template>

<script>
    export default {
        name: 'LayoutTemplate',
        props: {
            height: String,
            loading: { type: Boolean, default: false },
            filterModel: Object,
            tableColumns: Array,
            filterButton: { type: Boolean, default: true }
        }
    }
</script>

