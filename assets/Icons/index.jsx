import React from "react";
import Home from "./Home";
import ArrowLeft from "./ArrowLeft";
import Call from "./Call";
import Email from "./Email";
import Lock from "./Lock";
import User from "./User";
import Camera from "./Camera";
import Comment from "./Comment";
import Delete from "./Delete";
import Edit from "./Edit";
import Heart from "./Heart";
import Images from "./Images";
import Logout from "./Logout";
import Plus from "./Plus";
import Search from "./Search";
import Send from "./Send";
import Share from "./Share";
import ThreeDotHorizontal from "./ThreeDotHorizontal";
import Video from "./Video";
import Location from "./Location";
import PostLike from "./PostLike";

const icons = {
  home: Home,
  arleft: ArrowLeft,
  call: Call,
  mail: Email,
  lock: Lock,
  user: User,
  cam: Camera,
  cmt: Comment,
  del: Delete,
  edit: Edit,
  heart: Heart,
  img: Images,
  logout: Logout,
  plus: Plus,
  search: Search,
  send: Send,
  share: Share,
  threedothoriz: ThreeDotHorizontal,
  video: Video,
  loc: Location,
  location: Location,
  postlike: PostLike,
};

const Icons = ({ name }) => {
  const IconComponent = icons[name.toLowerCase()];
  if (!IconComponent) {
    console.error(`Icon "${name}" does not exist in the icons mapping.`);
    return null;
  }
  return <IconComponent />;
};

export default Icons;
