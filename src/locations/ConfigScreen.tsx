import React, { useCallback, useState, useEffect } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { Heading, Skeleton, Form, Checkbox, Paragraph, Flex, FormControl, TextInput, TextLink } from '@contentful/f36-components';
import { css } from 'emotion';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import { useWistia } from '../hooks/useWistia';
import { WistiaItem } from '../types';

export interface AppInstallationParameters {
  apiBearerToken: string;
  excludedProjects: WistiaItem[];
}



const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    apiBearerToken: '',
    excludedProjects: []
  });

  const sdk = useSDK<ConfigAppSDK>();
  const [projects, loading] = useWistia(parameters.apiBearerToken);
  const [excludedProjects, setExcludedProjects] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);


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
      setParameters({
        apiBearerToken: '',
        excludedProjects: []
      });
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();
      if (currentParameters && currentParameters.apiBearerToken) {
        setParameters(currentParameters);
        setExcludedProjects(currentParameters.excludedProjects.map((item) => item.hashedId));
      }
      setIsMounted(true);
      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  useEffect(() => {
    if (!isMounted) return;
    setParameters({
      apiBearerToken: parameters.apiBearerToken,
      excludedProjects: projects.filter(project => excludedProjects.includes(project.hashedId)),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludedProjects])

  return (isMounted &&
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
                value={projects.hashedId}
                isChecked={excludedProjects.includes(projects.hashedId)}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setExcludedProjects(excludedProjects.filter(project => project !== projects.hashedId))
                  } else {
                    setExcludedProjects(excludedProjects.concat(projects.hashedId));
                  }
                  console.log('checked')
                }}
              >
                {projects.name}
              </Checkbox>
            )
          })}
        </FormControl>
      </Form>
    </Flex >
  );
};

export default ConfigScreen;
