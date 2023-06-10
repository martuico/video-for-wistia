import React, { useCallback, useState, useEffect } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { Heading, Skeleton, Form, Checkbox, Paragraph, Flex, FormControl, TextInput, TextLink } from '@contentful/f36-components';
import { css } from 'emotion';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import { useWistia } from '../hooks/useWistia';

export interface AppInstallationParameters {
  apiBearerToken: string;
  excludedProjects: number[];
}



const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    //apiBearerToken: 'b5cfe07934edda82eda65b24e2e43854661f97ccea572bf48a732b5345f9dd36',
    apiBearerToken: '',
    excludedProjects: [],
  });
  const sdk = useSDK<ConfigAppSDK>();
  const [projects, loading] = useWistia(parameters.apiBearerToken);
  const [excludedProjects, setExcludedProjects] = useState<number[]>([]);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setParameters({
        ...parameters,
        excludedProjects
      })
    }, 100);
    return () => clearTimeout(timeOutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludedProjects])

  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();
    return {
      parameters,
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure, parameters]);


  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();
      if (currentParameters && currentParameters.apiBearerToken && currentParameters.excludedProjects.length > 0) {
        setParameters(currentParameters);
        setExcludedProjects(currentParameters.excludedProjects);
      } else {
        setParameters({
          apiBearerToken: '',
          excludedProjects: [],
        });
      }
      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);


  return (
    <Flex flexDirection="column" className={css({ margin: '80px', maxWidth: '800px' })}>
      <Form>
        <Heading className={css({ marginBottom: '0px' })}>Wistia Videos App Configuration</Heading>
        <Paragraph>Please provide your access bearer token for the Wistia Data API.</Paragraph>
        <FormControl>
          <FormControl.Label isRequired>Wistia Data API access bearer token</FormControl.Label>
          <TextInput
            value={parameters.apiBearerToken}
            type="text" name="accessToken"
            placeholder="Your access bearer token"
            onChange={(e) => setParameters({ ...parameters, apiBearerToken: e.target.value })} />
          <FormControl.HelpText>
            It's very important to provide a bearer token with "read only" permissions and the "all project and video data" options enabled. The token saved in this app will be accessible by the users of this Contentful space.
            <TextLink
              href="https://wistia.com/support/account-and-billing/setup#api-access"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to find your access bearer token
            </TextLink>
          </FormControl.HelpText>
        </FormControl>
        <FormControl>
          <FormControl.Label>Choose projects to exclude from the app.</FormControl.Label>
          <FormControl.HelpText>
            Choose any projects that you think aren't relevant to what editors are doing in this Contentful space.
          </FormControl.HelpText>

          {loading &&
            <>
              <Skeleton.Container>
                <Skeleton.BodyText numberOfLines={4} />
              </Skeleton.Container>
            </>
          }

          {projects && projects.map((projects, index) => {
            return (
              <Checkbox
                name={`projects-controlled-${index}`}
                id={`projects-controlled-${index}`}
                key={index}
                value={projects.id.toString()}
                isChecked={excludedProjects.includes(projects.id)}
                onChange={(e) => {
                  !e.target.checked ? setExcludedProjects(excludedProjects.filter(project => project !== projects.id)) :
                    setExcludedProjects(excludedProjects.concat(projects.id));


                }}
              >
                {projects.name}
              </Checkbox>
            )
          })}
        </FormControl>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;