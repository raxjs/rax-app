export default function genComboedScript(targets): string {
  if (!targets.length) return '';

  const comboedSrc =
   targets
     .map(({ src }) => src)
     .reduce(
       (curr, next, index) =>
         (index === 0 ? `${curr}${next}` : `${curr},${next}`), 'https://g.alicdn.com/??',
     );

  return `<script class="__combo_script__" crossorigin="anonymous" src="${comboedSrc}"></script>`;
}
