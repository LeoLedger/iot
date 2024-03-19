<template functional>
    <layout-col :column="false" width="50%" align="center" class="item-wrap">
        <layout-col width="80px" class="label">{{ props.label }}</layout-col>
        <layout-col auto>
            <slot/>
        </layout-col>
    </layout-col>
</template>
<style lang="scss" scoped>
.item-wrap {
    padding: 10px;
    .label {
        font-size: 12px;
        text-align: right;
        color: #333;
        margin-right: 10px;
        font-weight:bold;
    }
}
</style>

