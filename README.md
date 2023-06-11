## How to use

### `npm run create-app-definition`
1. App Name: `contentful-app-name`
2. Select App on where to render: `Important!` Make sure to select App Configuration and Entry Field:
![Screenshot](https://github.com/martuico/video-for-wistia/assets/2949921/dda94d14-457f-4467-a6b9-46b6fdc86d45)
3. Choose Type of Field: Arrow down and select `JSON Object`
![Screenshot](https://github.com/martuico/video-for-wistia/assets/2949921/a02629a9-0fa8-43e3-b7f2-ad6062a27d8c)

### App definition added Successfully!
Now we need to update our instance parameter to have select if Multiple or Single:
1. Go to custom Apps
2. Select Edit Definition
3. Go to Instance parameter definition
    ![Screenshot 202](https://github.com/martuico/video-for-wistia/assets/2949921/6e78ccb7-8628-4755-8bc6-cc5a45344bf2) 
    - Add instance parameter 
    ![Screenshot](https://github.com/martuico/video-for-wistia/assets/2949921/d90dc502-2c16-4e35-ad31-91ad14ecff61) 
    - #### `Important!` to use this as Display name `Select yes for single video`
    - Choose type boolean and leave as is
    - Click Save

#### `npm start`

Creates or updates your app definition in Contentful, and runs the app in development mode.
Open your app to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

#### `npm run upload`

Uploads the build folder to contentful and creates a bundle that is automatically activated.
The command guides you through the deployment process and asks for all required arguments.
Read [here](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/#deploy-with-contentful) for more information about the deployment process.


#### `npm run upload-ci`

Similar to `npm run upload` it will upload your app to contentful and activate it. The only difference is  
that with this command all required arguments are read from the environment variables, for example when you add
the upload command to your CI pipeline.

For this command to work, the following environment variables must be set:

- `CONTENTFUL_ORG_ID` - The ID of your organization
- `CONTENTFUL_APP_DEF_ID` - The ID of the app to which to add the bundle
- `CONTENTFUL_ACCESS_TOKEN` - A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens)

