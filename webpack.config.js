const GitRevisionPlugin = require("git-revision-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Webpack = require("webpack");

const path = require("path");
const gitRevision = new GitRevisionPlugin({ lightweightTags: true });

module.exports = (env, options) => ({
    entry: {
        bundle: path.join(__dirname, "src", "index.tsx"),
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "dist/",
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    devServer: {
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.(woff|woff2|ttf|png|svg|ttf|eot|mp3)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                },
            },
            {
                test: /\.tsx?/,
                loader: "ts-loader",
                options: {
                    configFile: path.join(__dirname, "tsconfig.json"),
                },
            },
            {
                test: /\.scss$/,
                use: [
                    options.mode === "production"
                        ? { loader: MiniCssExtractPlugin.loader, options: { publicPath: "." } }
                        : { loader: "style-loader" },
                    { loader: "css-loader" },
                    { loader: "sass-loader" },
                ],
            },
        ],
    },
    devtool: "source-map",
    plugins: [
        new Webpack.DefinePlugin({
            // Taken and adapted from the official README.
            // See: https://www.npmjs.com/package/git-revision-webpack-plugin
            SOFTWARE_VERSION: JSON.stringify(gitRevision.version()),
        }),
        new MiniCssExtractPlugin(),
    ],
});
