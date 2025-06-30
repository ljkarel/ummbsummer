import BadmintonIcon from '../strava_icons/BadmintonIcon';
import EBikeRideIcon from '../strava_icons/EBikeRideIcon';
import EMountainBikeRideIcon from '../strava_icons/EMountainBikeRideIcon';
import GolfIcon from '../strava_icons/GolfIcon';
import GravelRideIcon from '../strava_icons/GravelRideIcon';
import HandcycleIcon from '../strava_icons/HandcycleIcon';
import HIITIcon from '../strava_icons/HIITIcon';
import HikeIcon from '../strava_icons/HikeIcon';
import IceSkateIcon from '../strava_icons/IceSkateIcon';
import InlineSkateIcon from '../strava_icons/InlineSkateIcon';
import KayakIcon from '../strava_icons/KayakIcon';
import KitesurfIcon from '../strava_icons/KitesurfIcon';
import MountainBikeRideIcon from '../strava_icons/MountainBikeRideIcon';
import PickleballIcon from '../strava_icons/PickleballIcon';
import PilatesIcon from '../strava_icons/PilatesIcon';
import RacquetballIcon from '../strava_icons/RacquetballIcon';
import RideIcon from '../strava_icons/RideIcon';
import RockClimbingIcon from '../strava_icons/RockClimbingIcon';
import RowingIcon from '../strava_icons/RowingIcon';
import RunIcon from '../strava_icons/RunIcon';
import SailIcon from '../strava_icons/SailIcon';
import SkateboardIcon from '../strava_icons/SkateboardIcon';
import SkiIcon from '../strava_icons/SkiIcon';
import SnowboardIcon from '../strava_icons/SnowboardIcon';
import SnowshoeIcon from '../strava_icons/SnowshoeIcon';
import SoccerIcon from '../strava_icons/SoccerIcon';
import SquashIcon from '../strava_icons/SquashIcon';
import StandUpPaddlingIcon from '../strava_icons/StandUpPaddlingIcon';
import SurfingIcon from '../strava_icons/SurfingIcon';
import SwimIcon from '../strava_icons/SwimIcon';
import TableTennisIcon from '../strava_icons/TableTennisIcon';
import TennisIcon from '../strava_icons/TennisIcon';
import TrailRunIcon from '../strava_icons/TrailRunIcon';
import VelomobileIcon from '../strava_icons/VelomobileIcon';
import VirtualRowIcon from '../strava_icons/VirtualRowIcon';
import WalkIcon from '../strava_icons/WalkIcon';
import WeightTrainingIcon from '../strava_icons/WeightTrainingIcon';
import WheelchairIcon from '../strava_icons/WheelchairIcon';
import WorkoutIcon from '../strava_icons/WorkoutIcon';
import YogaIcon from '../strava_icons/YogaIcon';

const iconMap = {
  "Alpine Ski": SkiIcon,
  "Backcountry Ski": SkiIcon,
  "Badminton": BadmintonIcon,
  "Canoeing": KayakIcon,
  "Crossfit": WorkoutIcon,
  "E-Bike Ride": EBikeRideIcon,
  "Elliptical": WorkoutIcon,
  "E-Mountain Bike Ride": EMountainBikeRideIcon,
  "Golf": GolfIcon,
  "Gravel Ride": GravelRideIcon,
  "Handcycle": HandcycleIcon,
  "High Intensity Interval Training": HIITIcon,
  "Hike": HikeIcon,
  "Ice Skate": IceSkateIcon,
  "Inline Skate": InlineSkateIcon,
  "Kayaking": KayakIcon,
  "Kitesurf": KitesurfIcon,
  "Mountain Bike Ride": MountainBikeRideIcon,
  "Nordic Ski": SkiIcon,
  "Pickleball": PickleballIcon,
  "Pilates": PilatesIcon,
  "Racquetball": RacquetballIcon,
  "Ride": RideIcon,
  "Rock Climbing": RockClimbingIcon,
  "Roller Ski": SkiIcon,
  "Rowing": RowingIcon,
  "Run": RunIcon,
  "Sail": SailIcon,
  "Skateboard": SkateboardIcon,
  "Snowboard": SnowboardIcon,
  "Snowshoe": SnowshoeIcon,
  "Soccer": SoccerIcon,
  "Squash": SquashIcon,
  "Stair Stepper": WorkoutIcon,
  "Stand Up Paddling": StandUpPaddlingIcon,
  "Surfing": SurfingIcon,
  "Swim": SwimIcon,
  "Table Tennis": TableTennisIcon,
  "Tennis": TennisIcon,
  "Trail Run": TrailRunIcon,
  "Velomobile": VelomobileIcon,
  "Virtual Ride": RideIcon,
  "Virtual Row": VirtualRowIcon,
  "Virtual Run": RunIcon,
  "Walk": WalkIcon,
  "Weight Training": WeightTrainingIcon,
  "Wheelchair": WheelchairIcon,
  "Windsurf": SailIcon,
  "Workout": WorkoutIcon,
  "Yoga": YogaIcon,
};

export default function SportTypeIcon( {sportType, ...props }) {
  const IconComponent = iconMap[sportType];
  return <IconComponent sx={{ color: 'inherit', ...props.sx }} {...props} />
}