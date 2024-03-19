export default {
  inserted(el, binding) {
    el.addEventListener("click", e => {
      if (!el.disabled) {
        el.disabled = true;
        setTimeout(() => {
          el.disabled = false;
        }, binding.value || 3000);
      }
    });
  }
};
