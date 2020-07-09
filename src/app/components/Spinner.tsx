import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./Spinner.scss";

/**
 * Component which will display a spinner.
 */
class Spinner extends Component<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { className, ...props } = this.props;
        return (
            <div {...props} className={classNames("spinner", className)} />
        );
    }
}

export default Spinner;
