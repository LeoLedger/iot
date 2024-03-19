<script>
    export default {
        name: 'MenuItem',
        functional: true,
        props: {
            meta: {
                type: Object,
                default: () => {
                    return {
                        title: '',
                        icon: ''
                    }
                }
            },
            root: { type: Boolean, default: false }
        },
        render(h, context) {
            const { icon, title } = context.props.meta
            const vnodes = []

            if (icon) {
                vnodes.push(<div><svg-icon icon-class={icon}/></div>)
            }

            if (title) {
                vnodes.push(<span class={'text folded f2' + (context.props.root ? ' root' : '')} slot='title'>{(title)}</span>)
            }
            return vnodes
        }
    }
</script>
