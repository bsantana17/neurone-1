import { Mongo } from 'meteor/mongo';

export const ScrollMoves = new Mongo.Collection('scrollmoves');

ScrollMoves.allow({
  insert(userId, sm) {
    return userId && sm.userId === userId;
  },
  update(userId, sm, fields, modifier) {
    return userId && sm.userId === userId;
  },
  remove(userId, sm) {
    return userId && sm.userId === userId;
  }
});