import { MessageList, MessageInput, Thread, Window, useChannelActionContext, Avatar, useChannelStateContext, useChatContext, Message } from 'stream-chat-react';
import { ChannelInfo } from '../assets/assets';
import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import axios from 'axios';

export const GiphyContext = React.createContext({});

const S3_BUCKET = "rekog123-buck";
const REGION = "ap-south-1";

AWS.config.update({
  accessKeyId: "AKIAXVEV6RBRKUXQWDP4",
  secretAccessKey: "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",
});

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

const rekognition = new AWS.Rekognition({ region: REGION });


const ChannelInner = ({ setIsEditing }) => {
  const [giphyState, setGiphyState] = useState(false);
  const { sendMessage } = useChannelActionContext();
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [name, setName] = useState(null);
  const [results, setResults] = useState([]);
  const [notdetect, setdetect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vdodetect, setvdodetect] = useState([]);

  const overrideSubmitHandler = (message) => {
    var uploadProgress;
    let updatedMessage = {
      attachments: message.attachments,
      mentioned_users: message.mentioned_users,
      parent_id: message.parent?.id,
      parent: message.parent,
      text: message.text,
    };
    if (giphyState) {
      updatedMessage = { ...updatedMessage, text: `/giphy ${message.text}` };
    }
    var b = message.text;
    if (message.text) {
      const handleSubmit = async () => {
        const data = new FormData();
        console.log(b);
        data.append("text", b);
        data.append("lang", "en");
        data.append("opt_countries", "us,gb,fr");
        data.append("mode", "standard");
        data.append("api_user", "1489988880");
        data.append("api_secret", "DP3wH7nDkRjxEUdFQ9xH");

        try {
          const response = await axios({
            method: "post",
            url: "https://api.sightengine.com/1.0/text/check.json",
            data,
            headers: {
              lang: "en",
              opt_countries: "us,gb,fr",
              mode: "standard",
              api_user: "1489988880",
              api_secret: "DP3wH7nDkRjxEUdFQ9xH",
            },
          });
          console.log(response.data.profanity.matches[0]);
          if (response.data.profanity.matches[0] != null) {

            alert("Profanity detected in the message!");

          }
          else if (response.data.profanity.matches[0] === undefined) {

            sendMessage(updatedMessage);
            setGiphyState(false);
          }
        } catch (error) {
          if (error.response) console.log(error.response.data);
          else console.log(error.message);
        }

      };
      { handleSubmit() };
      return;
    }
    else if (notdetect == true) {
      if (sendMessage) {
        sendMessage(updatedMessage);
        setGiphyState(false);
        setdetect(null);
      }

    }
    else if (message.attachments[0].type == "video") {
      setName(message.attachments[0].title);
      axios.get(message.attachments[0].asset_url, { responseType: 'blob' })
        .then(response => {
          const imageBlob = response.data;
          const myBucket = new AWS.S3({
            params: { Bucket: S3_BUCKET },
            region: REGION,
          });
          const params = {
            Body: imageBlob,
            Bucket: S3_BUCKET,
            Key: message.attachments[0].title,
          };

          myBucket
            .putObject(params)
            .on("httpUploadProgress", (evt) => {
              uploadProgress = Math.round((evt.loaded / evt.total) * 100);
              setProgress(Math.round((evt.loaded / evt.total) * 100));
              if (uploadProgress === 100) {
                setProgress(null);
                const moderationParams = {
                  Video: {
                    S3Object: {
                      Bucket: "rekog123-buck",
                      Name: message.attachments[0].title,
                    },
                  },
                  MinConfidence: 80,
                };
                rekognition.startContentModeration(moderationParams, (err, data) => {
                  if (err) {
                    console.error('Error:', err);
                    setLoading(false);
                    return;
                  }

                  console.log('Moderation job created:', data.JobId);
                  const getModerationResults = () => {
                    const params = {
                      JobId: data.JobId,
                    };
                    console.log("Jog ID:", data.JobId);
                    rekognition.getContentModeration(params, (err, data) => {
                      if (err) {
                        console.error('Error:', err);
                        setLoading(false);
                        return;
                      }
                      console.log('Moderation results:', data.ModerationLabels);
                      setResults(data.ModerationLabels);

                      if (data.JobStatus === 'IN_PROGRESS') {
                        setTimeout(getModerationResults, 5000);
                      } else {
                        setLoading(false);
                        const isDetected = null;
                        data.ModerationLabels.map((one) => {
                          alert("Inappropriate content present in the video. Message cannot be sent!");
                          isDetected = one.ModerationLabel.Confidence;

                        })
                        if (isDetected && data.JobStatus === 'SUCCEEDED') {

                          alert("Inappropriate content present in the video. Message cannot be sent!");
                        }
                        else if (!isDetected && data.JobStatus === 'SUCCEEDED') {
                          sendMessage(updatedMessage);
                          setGiphyState(false);
                        }
                        isDetected = null;
                      }
                    });
                  };
                  getModerationResults();
                })
              }
            })
            .send((err) => {
              if (err) console.log(err);
            });
        })
        .catch(error => {
          console.log(error);
        });
    }

    else if (message.attachments[0].type == "image") {
      setName(message.attachments[0].fallback);
      axios.get(message.attachments[0].image_url, { responseType: 'blob' })
        .then(response => {
          const imageBlob = response.data;
          const myBucket = new AWS.S3({
            params: { Bucket: S3_BUCKET },
            region: REGION,
          });
          const params = {
            Body: imageBlob,
            Bucket: S3_BUCKET,
            Key: message.attachments[0].fallback,
          };

          myBucket
            .putObject(params)
            .on("httpUploadProgress", (evt) => {
              uploadProgress = Math.round((evt.loaded / evt.total) * 100);
              setProgress(Math.round((evt.loaded / evt.total) * 100));
              if (uploadProgress === 100) {
                setProgress(null);
                const rek_params = {
                  Image: {
                    S3Object: {
                      Bucket: S3_BUCKET,
                      Name: message.attachments[0].fallback,
                    },
                  },
                  MinConfidence: 90,
                };

                rekognition.detectModerationLabels(rek_params, (err, data) => {
                  if (err) {
                    console.log(err, err.stack);
                  } else {
                    setResults(data.ModerationLabels);
                    const isDetected = data.ModerationLabels.some(
                      (label) => label.Confidence > 90
                    );
                    if (isDetected) {
                      alert("Inappropriate content present in the image. Message cannot be sent!");

                    }
                    else if (!isDetected) {
                      sendMessage(updatedMessage);
                      setGiphyState(false);
                    }
                    isDetected = null;
                  }
                });
              }
            })
            .send((err) => {
              if (err) console.log(err);
            });
        })
        .catch(error => {
          console.log(error);
        });
    }
    console.log("Message", message);
  };

  return (
    <GiphyContext.Provider value={{ giphyState, setGiphyState }}>
      <div style={{ display: 'flex', width: '100%' }}>
        <Window>
          <TeamChannelHeader setIsEditing={setIsEditing} />
          <MessageList />
          <MessageInput overrideSubmitHandler={overrideSubmitHandler}><input type='text' /> </MessageInput>
        </Window>
        <Thread />
      </div>
    </GiphyContext.Provider>
  );
};

const TeamChannelHeader = ({ setIsEditing }) => {
  const { channel, watcher_count } = useChannelStateContext();
  const { client } = useChatContext();

  const MessagingHeader = () => {
    const members = Object.values(channel.state.members).filter(({ user }) => user.id !== client.userID);
    const additionalMembers = members.length - 3;

    if (channel.type === 'messaging') {
      return (
        <div className='team-channel-header__name-wrapper'>
          {members.map(({ user }, i) => (
            <div key={i} className='team-channel-header__name-multi'>
              <Avatar image={user.image} name={user.fullName || user.id} size={32} />
              <p className='team-channel-header__name user'>{user.fullName || user.id}</p>
            </div>
          ))}

          {additionalMembers > 0 && <p className='team-channel-header__name user'>and {additionalMembers} more</p>}
        </div>
      );
    }

    return (
      <div className='team-channel-header__channel-wrapper'>
        <p className='team-channel-header__name'># {channel.data.name}</p>
        <span style={{ display: 'flex' }} onClick={() => setIsEditing(true)}>
          <ChannelInfo />
        </span>
      </div>
    );
  };

  const getWatcherText = (watchers) => {
    if (!watchers) return 'No users online';
    if (watchers === 1) return '1 user online';
    return `${watchers} users online`;
  };

  return (
    <div className='team-channel-header__container'>
      <MessagingHeader />
      <div className='team-channel-header__right'>
        <p className='team-channel-header__right-text'>{getWatcherText(watcher_count)}</p>
      </div>
    </div>
  );
};

export default ChannelInner;