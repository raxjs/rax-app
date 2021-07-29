export default function genComboedScript(targets): string {
  return `<script class="__combo_script__" crossorigin="anonymous" src="${targets.map(({ src }) => src).reduce(
    (curr, next, index) => (index === 0 ? `${curr}${next}` : `${curr},${next}`), 'https://g.alicdn.com/??',
  )}"></script>`;
}
