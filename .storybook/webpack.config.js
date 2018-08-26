const path = require('path');

// Export a function. Accept the base config as the only param.
module.exports = (storybookBaseConfig, configType) => {
    // configType has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    const toResolvedPath = targetPath => path.resolve(__dirname, targetPath);

    // Make whatever fine-grained changes you need
    const resolvedCustomModulePaths = [
        '../node_modules/functional_tasks/src',
    ].map(toResolvedPath);

    storybookBaseConfig.resolve.modules = [
        ...storybookBaseConfig.resolve.modules,
        ...resolvedCustomModulePaths
    ];

    // Return the altered config
    return storybookBaseConfig;
};