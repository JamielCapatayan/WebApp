import Dispatcher from "../dispatcher/Dispatcher";
import FluxMapStore from "flux/lib/FluxMapStore";
import FriendActions from "../actions/FriendActions";
const assign = require("object-assign");
const cookies = require("../utils/cookies");

class FriendStore extends FluxMapStore {

  currentFriends (){
    let current_friends = this.getDataFromArr(this.getState().current_friends) || {};
    return current_friends;
  }

  currentFriendsIndexed (){
    let current_friends = this.getIndexFromArr(this.getState().current_friends) || {};
    return current_friends;
  }

  isFriend (voter_we_vote_id) {
    let current_friends_index = this.currentFriendsIndexed();  // TODO DALE THIS NEEDS TO BE TESTED
    if (current_friends_index[voter_we_vote_id] != undefined) {
      return true;
    }
    return false;
  }

  getDataFromArr (arr) {
    if (arr == undefined) {
      return [];
    }
    let data_list = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      data_list.push( arr[i] );
    }
    return data_list;
  }

  getIndexFromArr (arr) {
    if (arr == undefined) {
      return [];
    }
    let indexed_data_list = [];
    let friend_voter_we_vote_id;
    for (var i = 0, len = arr.length; i < len; i++) {
      friend_voter_we_vote_id = arr[i].voter_we_vote_id;
      indexed_data_list[friend_voter_we_vote_id] = arr[i];
    }
    return indexed_data_list;
  }

  friendInvitationsSentByMe (){
    return this.getDataFromArr(this.getState().friend_invitations_sent_by_me) || {};
  }

  friendInvitationsSentToMe (){
    return this.getDataFromArr(this.getState().friend_invitations_sent_to_me) || {};
  }

  reduce (state, action) {

    switch (action.type) {
      case "friendInviteResponse":
        if (!action.res.success) {
          // There was a problem
          FriendActions.friendInvitationsSentToMe();
          // console.log("FriendStore friendInviteResponse incoming data NO SUCCESS, action.res:", action.res);
          return {
            ...state
          }
        } else if (action.res.kind_of_invite_response === "ACCEPT_INVITATION") {
          // console.log("FriendStore friendInviteResponse incoming data ACCEPT_INVITATION, action.res:", action.res);
          FriendActions.friendInvitationsSentToMe();
          // We update the current_friends locally because it could be a heavy API call we don't want to call too often
          return {
            ...state,
            current_friends: assign({}, state.current_friends, { [action.res.voter_we_vote_id]: action.res.friend_voter })
          }
        } else if (action.res.kind_of_invite_response === "IGNORE_INVITATION") {
          FriendActions.friendInvitationsSentToMe();
          // console.log("FriendStore friendInviteResponse incoming data IGNORE_INVITATION, action.res:", action.res);
          return {
            ...state
          }
        } else if (action.res.kind_of_invite_response === "DELETE_INVITATION_VOTER_SENT_BY_ME") {
          FriendActions.friendInvitationsSentByMe();
          // console.log("FriendStore friendInviteResponse incoming data DELETE_INVITATION_VOTER_SENT_BY_ME, action.res:", action.res);
          return {
            ...state
          }
        } else if (action.res.kind_of_invite_response === "DELETE_INVITATION_EMAIL_SENT_BY_ME") {
          FriendActions.friendInvitationsSentByMe();
          // console.log("FriendStore friendInviteResponse incoming data DELETE_INVITATION_EMAIL_SENT_BY_ME, action.res:", action.res);
          return {
            ...state
          }
        } else if (action.res.kind_of_invite_response === "UNFRIEND_CURRENT_FRIEND") {
          // Because of the potential size of the friend list, it would be better NOT to request the entire list
          // after un-friending, but we do it for now until we can refactor this
          FriendActions.currentFriends();
          // console.log("FriendStore friendInviteResponse incoming data UNFRIEND_CURRENT_FRIEND, action.res:", action.res);
          return {
            ...state
          }
        }
        return {
          ...state
        };

      case "friendInvitationByEmailSend":
        if (action.res.sender_voter_email_address_missing) {
          // Deal with this
        } else {
          // Reset the invitation form
        }
        FriendActions.friendInvitationsSentByMe();
        return {
          ...state
        };

      case "friendInvitationByTwitterHandleSend":
        FriendActions.friendInvitationsSentByMe();
        return {
          ...state
        };

      case "friendList":
        if (action.res.kind_of_list === "CURRENT_FRIENDS") {
          // console.log("FriendStore incoming data CURRENT_FRIENDS, action.res:", action.res);
          return {
            ...state,
            current_friends: action.res.friend_list
          }
        } else if (action.res.kind_of_list === "FRIEND_INVITATIONS_SENT_BY_ME") {
          // console.log("FriendStore incoming data FRIEND_INVITATIONS_SENT_BY_ME, action.res:", action.res);
          return {
            ...state,
            friend_invitations_sent_by_me: action.res.friend_list
          }
        } else if (action.res.kind_of_list === "FRIEND_INVITATIONS_SENT_TO_ME") {
          // console.log("FriendStore incoming data FRIEND_INVITATIONS_SENT_TO_ME, action.res:", action.res);
          return {
            ...state,
            friend_invitations_sent_to_me: action.res.friend_list
          }
        }

        return {
          ...state
        };

      default:
        return state;
    }
  }
}

module.exports = new FriendStore(Dispatcher);