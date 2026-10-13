export interface UserProps {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.createdAt = props.createdAt ?? new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
