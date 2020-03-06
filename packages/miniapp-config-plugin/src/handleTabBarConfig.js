// if (tabBarConfig.items && tabBarConfig.items.length) {
//   const tabBar = Object.assign({}, tabBarConfig);
//   tabBar.items = tabBarConfig.items.map(item => {
//     const iconPathName = item.icon
//       ? md5File(path.resolve('src', item.icon)) + path.extname(item.icon)
//       : '';
//     if (iconPathName)
//       copy(
//         path.resolve('src', item.icon),
//         path.resolve(outputPath, `images/${iconPathName}`)
//       );
//     const selectedIconPathName = item.activeIcon
//       ? md5File(path.resolve('src', item.activeIcon)) +
//         path.extname(item.activeIcon)
//       : '';
//     if (selectedIconPathName)
//       copy(
//         path.resolve('src', item.activeIcon),
//         path.resolve(outputPath, `images/${selectedIconPathName}`)
//       );
//     tabBarMap[`/${item.pageName}`] = true;

//     return {
//       pagePath: `${item.pagePath}`,
//       name: item.name,
//       icon: iconPathName ? `./images/${iconPathName}` : '',
//       activeIcon: selectedIconPathName
//         ? `./images/${selectedIconPathName}`
//         : ''
//     };
//   });

//   if (tabBar.custom) {
//     // 自定义 tabBar
//     const customTabBarDir = tabBar.custom;
//     tabBar.custom = true;
//     copy(customTabBarDir, path.resolve(outputPath, '../custom-tab-bar'));
//   }
