import { Link } from "react-router-dom";

function Heading(props: {
  heading: string;
  subheading: string;
  link: string;
  log: string;
}) {
  return (
    <div className="text-center mb-6 sm:mb-7">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">{props.heading}</h1>
      <p className="text-white/40 text-sm">
        {props.subheading}{" "}
        {props.link && (
          <Link
            to={props.link}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {props.log}
          </Link>
        )}
      </p>
    </div>
  );
}

export default Heading;
