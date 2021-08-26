## FluidCanvas
### earthquake(intensity, duration, iteration)

- Screen Rumble
- User localizable 

|Param| Type |Desctiption| 
|--|--|--|
| intensity| Number  | Value to change pixel offset for the shake effect
| duration| Number  | Value in milliseconds for each iteration, default value 500
| iteration| Number  | Number of times to repeat the animation, default value 3

### heartBeat(intensity, duration, iteration)

- Screen pulse using scale
- User localizable 

|Param| Type |Desctiption| 
|--|--|--|
| intensity| Number  | Value to change zoom for the scale effect, 1 = default, > 1 = larger effect, < 1 = smaller (hard coded, cannot increase/decrease further)
| duration| Number  | Value in milliseconds for each iteration, default value 1500
| iteration| Number  | Number of times to repeat the animation, default value 3

### spin(intensity, duration, iteration)

- Spin screen
- Actuall speed determined by `duration/intensity`
- User localizable 

|Param| Type |Desctiption| 
|--|--|--|
| intensity| Number  | Value to change spin speed
| duration| Number  | Value in milliseconds for each iteration, default value 400
| iteration| Number  | Number of times to repeat the animation, default value 3


### drugged(userID, intensity, duration, iteration)
- Actually executes the `drug()` method, will not survive refreshes if called on its own
- Slow sway and hue shift tint
- User localizable 

|Param| Type |Desctiption| 
|--|--|--|
| userID | Array | Array of User ID's to apply the effect to
| intensity| Number  | Value to change blur strength and rotation angle
| duration| Number  | Value in milliseconds for each iteration, default value 1000
| iteration| Number  | Number of times to repeat the animation, default value Infinity

### fade()
- Fade canvas to non-visible
- No parameters
- Will not survive refreshes

### drug(userID, intensity, duration, iteration)
- Internally calls `drugged()` will survive refreshes

 |Param| Type |Desctiption| 
|--|--|--|
| userID | Array | Array of User ID's to apply the effect to
| intensity| Number  | Value to change blur strength and rotation angle
| duration| Number  | Value in milliseconds for each iteration, default value 1000
| iteration| Number  | Number of times to repeat the animation, default value Infinity

### sepia(userID)
- Gives canvas a sepia tint

Param| Type |Desctiption| 
|--|--|--|
| userID | Array | Array of User ID's to apply the effect to

### blur(userID, intensity) 

|Param| Type |Desctiption| 
|--|--|--|
| userID | Array | Array of User ID's to apply the effect to
| intensity| Number  | Value to change blur strength in pixels

### negative()
- Negative tint to entire screen

Param| Type |Desctiption| 
|--|--|--|
| userID | Array | Array of User ID's to apply the effect to


### black()
- Turns entire screen black

Param| Type |Desctiption| 
|--|--|--|
| userID | Array | Array of User ID's to apply the effect to

