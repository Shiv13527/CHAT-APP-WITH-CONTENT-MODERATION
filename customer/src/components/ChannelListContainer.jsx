import React, { useState } from 'react';
import { ChannelList, useChatContext } from 'stream-chat-react';
import Cookies from 'universal-cookie';
import { ChannelSearch, TeamChannelList, TeamChannelPreview } from '.';
import './Channel.css'
import MeetChatIcon from '../assets/assets/meetchat.png';
import LogoutIcon from '../assets/assets/logout.png';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Box } from '@mui/material';

function logout() {
  cookies.remove("token");
  cookies.remove('userId');
  cookies.remove('username');
  cookies.remove('fullName');
  cookies.remove('avatarURL');
  cookies.remove('hashedPassword');
  cookies.remove('phoneNumber');

  window.location.reload();
}

const cookies = new Cookies();
// const SideBar = ({ logout }) => (
//   <div >
//     <div >
//       <div >
//         <img src={MeetChatIcon} alt="MeetChat" width="32" />
//       </div>
//     </div>
//     <div >
//       <div onClick={logout}>
//         <LogoutRoundedIcon />
//       </div>
//     </div>
//   </div>
// );

const CompanyHeader = () => (
  <div >
    <Box>
      <p className="head_text"><img className='head_logo' src="https://img.icons8.com/?size=512&id=db5AhYVEHAtC&format=png" />Meet-Messanger<LogoutRoundedIcon className='log' onClick={logout} /></p>
    </Box>

  </div>
)

const customChannelTeamFilter = (channels) => {
  return channels.filter((channel) => channel.type === 'team');
}

const customChannelMessagingFilter = (channels) => {
  return channels.filter((channel) => channel.type === 'messaging');
}

const ChannelListContent = ({ isCreating, setIsCreating, setCreateType, setIsEditing, setToggleContainer }) => {
  const { client } = useChatContext();

  const logout = () => {
    cookies.remove("token");
    cookies.remove('userId');
    cookies.remove('username');
    cookies.remove('fullName');
    cookies.remove('avatarURL');
    cookies.remove('hashedPassword');
    cookies.remove('phoneNumber');

    window.location.reload();
  }

  const filters = { members: { $in: [client.userID] } };

  return (
    <>
      {/* <SideBar logout={logout} /> */}
      <div className="channel-list__list__wrapper">
        <CompanyHeader />
        <ChannelSearch setToggleContainer={setToggleContainer} />
        <ChannelList
          filters={filters}
          channelRenderFilterFn={customChannelTeamFilter}
          List={(listProps) => (
            <TeamChannelList
              {...listProps}
              type="team"
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              setCreateType={setCreateType}
              setIsEditing={setIsEditing}
              setToggleContainer={setToggleContainer}
            />
          )}
          Preview={(previewProps) => (
            <TeamChannelPreview
              {...previewProps}
              setIsCreating={setIsCreating}
              setIsEditing={setIsEditing}
              setToggleContainer={setToggleContainer}
              type="team"
            />
          )}
        />
        <ChannelList
          filters={filters}
          channelRenderFilterFn={customChannelMessagingFilter}
          List={(listProps) => (
            <TeamChannelList
              {...listProps}
              type="messaging"
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              setCreateType={setCreateType}
              setIsEditing={setIsEditing}
              setToggleContainer={setToggleContainer}
            />
          )}
          Preview={(previewProps) => (
            <TeamChannelPreview
              {...previewProps}
              setIsCreating={setIsCreating}
              setIsEditing={setIsEditing}
              setToggleContainer={setToggleContainer}
              type="messaging"
            />
          )}
        />
      </div>
    </>
  );
}

const ChannelListContainer = ({ setCreateType, setIsCreating, setIsEditing }) => {
  const [toggleContainer, setToggleContainer] = useState(false);

  return (
    <>
      <div className="channel-list__container">
        <ChannelListContent
          setIsCreating={setIsCreating}
          setCreateType={setCreateType}
          setIsEditing={setIsEditing}
        />
      </div>

      <div className="channel-list__container-responsive"
        style={{ left: toggleContainer ? "0%" : "-89%", backgroundColor: "#005fff" }}
      >
        <div className="channel-list__container-toggle" onClick={() => setToggleContainer((prevToggleContainer) => !prevToggleContainer)}>
        </div>
        <ChannelListContent
          setIsCreating={setIsCreating}
          setCreateType={setCreateType}
          setIsEditing={setIsEditing}
          setToggleContainer={setToggleContainer}
        />
      </div>
    </>
  )

}

export default ChannelListContainer;