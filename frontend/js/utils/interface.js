
/**
 * @typedef { Object } ParsedResponse
 * @property { boolean } ok
 * @property { number } status
 * @property { JSON | string | undefined } data
*/

/**
 * @typedef { Object } User
 * @property { number } user_id
 * @property { string } email
 * @property { string } username
 * @property { boolean } verified
 * @property { boolean } logged_in
 * @property { boolean } mail_preference
*/

export { User, ParsedResponse };